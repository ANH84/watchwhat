const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'TMDB_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      action,
      page = 1,
      media_type = 'tv',
      providers = [],
      genres = [],
      languages = [],
      mediaType,
      tmdbId,
    } = body;

    const isV4Token = apiKey.startsWith('eyJ');
    const baseHeaders: Record<string, string> = { Accept: 'application/json' };
    if (isV4Token) {
      baseHeaders.Authorization = `Bearer ${apiKey}`;
    }

    const buildUrl = (path: string, params: Record<string, string> = {}) => {
      const allParams = new URLSearchParams({ language: 'en-US', ...params });
      if (!isV4Token) allParams.set('api_key', apiKey);
      return `https://api.themoviedb.org/3${path}?${allParams.toString()}`;
    };

    // Handle details action for watchlist
    if (action === 'details' && mediaType && tmdbId) {
      const detailUrl = buildUrl(`/${mediaType}/${tmdbId}`);
      const detailRes = await fetch(detailUrl, { headers: baseHeaders });
      if (!detailRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch details' }),
          { status: detailRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const detailData = await detailRes.json();
      return new Response(
        JSON.stringify(detailData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use discover endpoint for filtering
    const sortKey = media_type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
    const discoverParams: Record<string, string> = {
      page: String(page),
      sort_by: sortKey,
      'vote_count.gte': '50',
      watch_region: 'US',
    };

    if (providers.length > 0) {
      discoverParams.with_watch_providers = providers.join('|');
      discoverParams.with_watch_monetization_types = 'flatrate';
    }

    if (genres.length > 0) {
      discoverParams.with_genres = genres.join('|');
    }

    if (languages.length > 0) {
      discoverParams.with_original_language = languages.join('|');
    }

    const discoverUrl = buildUrl(`/discover/${media_type}`, discoverParams);
    const tmdbRes = await fetch(discoverUrl, { headers: baseHeaders });

    if (!tmdbRes.ok) {
      const errText = await tmdbRes.text();
      console.error('TMDB error:', errText);
      return new Response(
        JSON.stringify({ error: `TMDB API error: ${tmdbRes.status}` }),
        { status: tmdbRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tmdbData = await tmdbRes.json();

    // Fetch genre list
    const genreUrl = buildUrl(`/genre/${media_type}/list`);
    const genreRes = await fetch(genreUrl, { headers: baseHeaders });
    const genreData = await genreRes.json();
    const genreMap: Record<number, string> = {};
    (genreData.genres || []).forEach((g: { id: number; name: string }) => {
      genreMap[g.id] = g.name;
    });

    // Fetch watch providers for each show in parallel
    const providerPromises = tmdbData.results.map(async (item: any) => {
      try {
        const provUrl = buildUrl(`/${media_type}/${item.id}/watch/providers`);
        const provRes = await fetch(provUrl, { headers: baseHeaders });
        const provData = await provRes.json();
        const region = provData.results?.US || provData.results?.GB || provData.results?.AE || Object.values(provData.results || {})[0] as any;
        const flatrate = (region as any)?.flatrate || [];
        return flatrate.map((p: any) => ({
          name: p.provider_name,
          logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
        }));
      } catch {
        return [];
      }
    });

    const allProviders = await Promise.all(providerPromises);

    const titleKey = media_type === 'movie' ? 'title' : 'name';
    const dateKey = media_type === 'movie' ? 'release_date' : 'first_air_date';

    // Transform to our Show format
    const shows = tmdbData.results.map((item: any, i: number) => ({
      id: `${media_type}-${item.id}`,
      title: item[titleKey] || item.original_name || item.original_title,
      genre: (item.genre_ids || []).map((id: number) => genreMap[id] || 'Unknown').filter(Boolean),
      year: item[dateKey] ? parseInt(item[dateKey].substring(0, 4)) : 0,
      rating: Math.round((item.vote_average || 0) * 10) / 10,
      description: item.overview || '',
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '',
      platform: allProviders[i]?.[0]?.name || 'TV',
      providers: allProviders[i] || [],
    }));

    return new Response(
      JSON.stringify({ shows, totalPages: tmdbData.total_pages, page: tmdbData.page }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
