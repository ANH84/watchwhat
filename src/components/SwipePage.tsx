import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Users, Loader2, User, Heart, Clock, Tv } from "lucide-react";
import ShowCard from "@/components/ShowCard";
import MatchReveal from "@/components/MatchReveal";
import FilterScreen, { FilterSelections } from "@/components/FilterScreen";
import { Show } from "@/data/shows";
import { submitVote } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { useTmdbShows, TmdbFilters } from "@/hooks/useTmdbShows";
import { getTitlesPreference } from "@/components/SettingsPage";

interface SwipePageProps {
  sessionId: string;
  sessionCode: string;
  player: 1 | 2;
  playerName?: string;
  onBack: () => void;
  onOpenSettings?: () => void;
  mode?: "solo" | "multi";
}

const SwipePage = ({ sessionId, sessionCode, player, playerName, onBack, onOpenSettings, mode = "multi" }: SwipePageProps) => {
  const [filters, setFilters] = useState<TmdbFilters | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedShow, setMatchedShow] = useState<Show | null>(null);
  const [matches, setMatches] = useState<Show[]>([]);
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [partnerLikes, setPartnerLikes] = useState<Set<string>>(new Set());
  const [notTonightIds, setNotTonightIds] = useState<Set<string>>(new Set());

  const defaultFilters: TmdbFilters = { mediaType: "tv", providers: [8], genres: [], languages: [] };
  const { shows: rawShows, loading: showsLoading, error: showsError } = useTmdbShows(filters || defaultFilters, 1);
  const shows = useMemo(() => rawShows.slice(0, getTitlesPreference()), [rawShows]);
  const currentShow = shows[currentIndex];
  const isDone = currentIndex >= shows.length;
  const otherPlayer = player === 1 ? 2 : 1;

  // Subscribe to partner's votes in real-time
  useEffect(() => {
    const channel = supabase
      .channel(`votes-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const vote = payload.new as { player: number; show_id: string; liked: boolean };
          if (vote.player === otherPlayer && vote.liked) {
            setPartnerLikes((prev) => {
              const next = new Set(prev);
              next.add(vote.show_id);
              if (myLikes.has(vote.show_id)) {
                const show = shows.find((s) => s.id === vote.show_id);
                if (show) {
                  setMatchedShow(show);
                  setMatches((prev) => [...prev, show]);
                }
              }
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, otherPlayer, myLikes, shows]);

  // Load existing votes on mount
  useEffect(() => {
    if (!filters) return; // Don't load votes until filters are applied
    const loadVotes = async () => {
      const { data } = await supabase
        .from("votes")
        .select()
        .eq("session_id", sessionId);
      
      const { data: allNotTonightData } = await supabase
        .from("votes")
        .select("show_id")
        .eq("player", player)
        .eq("vote_type", "not_tonight");

      if (!data) return;

      const myLikedIds = new Set<string>();
      const partnerLikedIds = new Set<string>();
      const matchedShows: Show[] = [];
      const prevNotTonight = new Set<string>(
        (allNotTonightData || []).map((v) => v.show_id)
      );

      data.forEach((v) => {
        if (v.player === player && v.liked) myLikedIds.add(v.show_id);
        if (v.player === otherPlayer && v.liked) partnerLikedIds.add(v.show_id);
      });

      myLikedIds.forEach((id) => {
        if (partnerLikedIds.has(id)) {
          const show = shows.find((s) => s.id === id);
          if (show) matchedShows.push(show);
        }
      });

      setMyLikes(myLikedIds);
      setPartnerLikes(partnerLikedIds);
      setMatches(matchedShows);
      setNotTonightIds(prevNotTonight);

      const myVotedIds = new Set(data.filter((v) => v.player === player).map((v) => v.show_id));
      const nextIndex = shows.findIndex((s) => !myVotedIds.has(s.id));
      if (nextIndex === -1) {
        setCurrentIndex(shows.length);
      } else {
        setCurrentIndex(nextIndex);
      }
    };
    loadVotes();
  }, [sessionId, player, otherPlayer, shows, filters]);

  const handleVote = useCallback(
    async (liked: boolean, voteType: "liked" | "skipped" | "not_tonight" = liked ? "liked" : "skipped") => {
      if (!currentShow) return;

      try {
        await submitVote(sessionId, currentShow.id, player, liked, voteType);
      } catch {
        // Ignore duplicate vote errors
      }

      if (liked) {
        setMyLikes((prev) => {
          const next = new Set(prev);
          next.add(currentShow.id);
          return next;
        });

        if (partnerLikes.has(currentShow.id)) {
          setMatchedShow(currentShow);
          setMatches((prev) => [...prev, currentShow]);
        }
      }

      setCurrentIndex((prev) => prev + 1);
    },
    [currentShow, sessionId, player, partnerLikes]
  );

  const handleFiltersApplied = async (selections: FilterSelections) => {
    const newFilters: TmdbFilters = {
      mediaType: selections.mediaType,
      providers: selections.providers,
      genres: selections.genres,
      languages: selections.languages,
    };
    setFilters(newFilters);
    setCurrentIndex(0);

    // Player 1 saves filters to session so Player 2 gets the same titles
    if (player === 1) {
      await supabase
        .from("sessions")
        .update({ filters: newFilters as any })
        .eq("id", sessionId);
    }
  };

  // Player 2: load filters from session (skip FilterScreen)
  useEffect(() => {
    if (player !== 2 || filters) return;
    const loadSessionFilters = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("filters")
        .eq("id", sessionId)
        .single();
      if (data?.filters) {
        setFilters(data.filters as unknown as TmdbFilters);
      }
    };
    loadSessionFilters();
  }, [player, sessionId, filters]);

  // Show filter screen only for Player 1
  if (!filters && player === 1) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
            <button onClick={onBack} className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-muted transition-colors">
              <Tv className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-sm text-foreground">WatchWhat?</span>
            </button>
            <div className="text-center">
              <span className="text-sm font-semibold text-muted-foreground">
                💜 {playerName || "Partner 1"}
              </span>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                Session: {sessionCode}
              </div>
            </div>
            {onOpenSettings ? (
              <button onClick={onOpenSettings} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <User className="w-5 h-5 text-muted-foreground" />
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
        <FilterScreen onApply={handleFiltersApplied} />
      </div>
    );
  }

  // Player 2 waiting for filters to load from session
  if (!filters && player === 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => setFilters(null)} className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-muted transition-colors">
            <Tv className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm text-foreground">WatchWhat?</span>
          </button>
          <div className="text-center">
            <span className="text-sm font-semibold text-muted-foreground">
              {player === 1 ? "💜" : "🧡"} {playerName || `Partner ${player}`}
            </span>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              Session: {sessionCode}
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
            {currentIndex}/{shows.length}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {showsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading shows...</p>
          </div>
        ) : showsError ? (
          <div className="text-center py-20">
            <p className="text-destructive font-semibold mb-2">Failed to load shows</p>
            <p className="text-muted-foreground text-sm">{showsError}</p>
          </div>
        ) : isDone ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h2 className="text-3xl font-display font-bold text-gradient mb-4">
              You're done! 🎬
            </h2>

            {mode === "solo" ? (
              <>
                {(() => {
                  const likedShows = shows.filter((s) => myLikes.has(s.id));
                  const notTonightShows = shows.filter((s) => notTonightIds.has(s.id));
                  const hasAny = likedShows.length > 0 || notTonightShows.length > 0;

                  return hasAny ? (
                    <>
                      <p className="text-muted-foreground mb-2">
                        Great taste! Here's what caught your eye.
                      </p>
                      <p className="text-sm text-primary font-medium mb-8">
                        ✨ These have been saved to your Watchlist
                      </p>

                      {likedShows.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
                            <Heart className="w-4 h-4 text-primary" /> Liked
                          </h3>
                          <div className="space-y-3">
                            {likedShows.map((show) => (
                              <div
                                key={show.id}
                                className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border shadow-sm"
                              >
                                <img
                                  src={show.poster}
                                  alt={show.title}
                                  className="w-14 h-20 rounded-lg object-cover"
                                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                                />
                                <div className="text-left">
                                  <h4 className="font-display font-bold text-card-foreground">{show.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {show.platform} · {show.year}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {notTonightShows.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
                            <Clock className="w-4 h-4 text-secondary" /> Not Tonight
                          </h3>
                          <div className="space-y-3">
                            {notTonightShows.map((show) => (
                              <div
                                key={show.id}
                                className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border shadow-sm opacity-80"
                              >
                                <img
                                  src={show.poster}
                                  alt={show.title}
                                  className="w-14 h-20 rounded-lg object-cover"
                                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                                />
                                <div className="text-left">
                                  <h4 className="font-display font-bold text-card-foreground">{show.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {show.platform} · {show.year}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground mb-6">
                      You didn't save any shows this time. Try again with different filters!
                    </p>
                  );
                })()}
              </>
            ) : (
              <>
                {matches.length > 0 ? (
                  <>
                    <p className="text-muted-foreground mb-8">
                      You matched on {matches.length} show{matches.length > 1 ? "s" : ""}!
                    </p>
                    <div className="space-y-4">
                      {matches.map((show) => (
                        <div
                          key={show.id}
                          className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border shadow-md"
                        >
                          <img
                            src={show.poster}
                            alt={show.title}
                            className="w-16 h-20 rounded-lg object-cover"
                            onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                          />
                          <div className="text-left">
                            <h4 className="font-display font-bold text-card-foreground">{show.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {show.platform} · {show.year}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No matches yet — your partner may still be swiping.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Come back later to check for matches!
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={onBack}
              className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Back to Home
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <ShowCard
              key={currentShow.id}
              show={currentShow}
              onLike={() => handleVote(true)}
              onSkip={() => handleVote(false)}
              onNotTonight={() => handleVote(false, "not_tonight")}
              wasNotTonight={notTonightIds.has(currentShow.id)}
            />
          </AnimatePresence>
        )}
      </div>

      {/* Match overlay */}
      <AnimatePresence>
        {matchedShow && (
          <MatchReveal
            show={matchedShow}
            onContinue={() => setMatchedShow(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwipePage;
