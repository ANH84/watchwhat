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

    const { page = 1, type = 'popular' } = await req.json().catch(() => ({}));

    // Fetch popular or top-rated TV shows
    const endpoint = type === 'top_rated' ? 'top_rated' : 'popular';
    
    // Support both v3 (api_key param) and v4 (Bearer token) auth
    const isV4Token = apiKey.startsWith('eyJ');
    const authUrl = isV4Token
      ? `https://api.themoviedb.org/3/tv/${endpoint}?language=en-US&page=${page}`
      : `https://api.themoviedb.org/3/tv/${endpoint}?language=en-US&page=${page}&api_key=${apiKey}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (isV4Token) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const tmdbRes = await fetch(authUrl, { headers });

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
    const genreUrl = isV4Token
      ? 'https://api.themoviedb.org/3/genre/tv/list?language=en'
      : `https://api.themoviedb.org/3/genre/tv/list?language=en&api_key=${apiKey}`;
    const genreRes = await fetch(genreUrl, { headers });
    const genreData = await genreRes.json();
    const genreMap: Record<number, string> = {};
    (genreData.genres || []).forEach((g: { id: number; name: string }) => {
      genreMap[g.id] = g.name;
    });

    // Transform to our Show format
    const shows = tmdbData.results.map((item: any) => ({
      id: `tmdb-${item.id}`,
      title: item.name || item.original_name,
      genre: (item.genre_ids || []).map((id: number) => genreMap[id] || 'Unknown').filter(Boolean),
      year: item.first_air_date ? parseInt(item.first_air_date.substring(0, 4)) : 0,
      rating: Math.round((item.vote_average || 0) * 10) / 10,
      description: item.overview || '',
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : '',
      platform: 'TV',
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
