import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Show } from "@/data/shows";

export interface TmdbFilters {
  mediaType: "tv" | "movie";
  providers: number[];
  genres: number[];
}

export function useTmdbShows(filters: TmdbFilters, pages = 3) {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      setError(null);
      try {
        const allShows: Show[] = [];
        
        for (let page = 1; page <= pages; page++) {
          const { data, error: fnError } = await supabase.functions.invoke("tmdb-shows", {
            body: {
              page,
              media_type: filters.mediaType,
              providers: filters.providers,
              genres: filters.genres,
            },
          });

          if (fnError) {
            console.error("Edge function error:", fnError);
            throw new Error(fnError.message);
          }

          if (data?.shows) {
            allShows.push(...data.shows);
          }
        }

        // Filter out shows without posters and deduplicate
        const unique = allShows.filter(
          (s, i, arr) => s.poster && arr.findIndex((x) => x.id === s.id) === i
        );

        setShows(unique);
      } catch (err) {
        console.error("Failed to fetch TMDB shows:", err);
        setError(err instanceof Error ? err.message : "Failed to load shows");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [pages, filters.mediaType, filters.providers.join(","), filters.genres.join(",")]);

  return { shows, loading, error };
}
