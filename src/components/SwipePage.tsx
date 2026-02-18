import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import ShowCard from "@/components/ShowCard";
import MatchReveal from "@/components/MatchReveal";
import { Show } from "@/data/shows";
import { submitVote } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { useTmdbShows } from "@/hooks/useTmdbShows";

interface SwipePageProps {
  sessionId: string;
  sessionCode: string;
  player: 1 | 2;
  onBack: () => void;
}

const SwipePage = ({ sessionId, sessionCode, player, onBack }: SwipePageProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedShow, setMatchedShow] = useState<Show | null>(null);
  const [matches, setMatches] = useState<Show[]>([]);
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [partnerLikes, setPartnerLikes] = useState<Set<string>>(new Set());
  const [notTonightIds, setNotTonightIds] = useState<Set<string>>(new Set());

  const { shows, loading: showsLoading, error: showsError } = useTmdbShows(3);
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
              // Check if we already liked this
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
    const loadVotes = async () => {
      // Load votes for this session
      const { data } = await supabase
        .from("votes")
        .select()
        .eq("session_id", sessionId);
      
      // Load all not_tonight votes for this player across all sessions
      // to flag previously interested shows
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

      // Find existing matches
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

      // Skip to where we left off
      const myVotedIds = new Set(data.filter((v) => v.player === player).map((v) => v.show_id));
      const nextIndex = shows.findIndex((s) => !myVotedIds.has(s.id));
      if (nextIndex === -1) {
        setCurrentIndex(shows.length);
      } else {
        setCurrentIndex(nextIndex);
      }
    };
    loadVotes();
  }, [sessionId, player, otherPlayer, shows]);

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

        // Check if partner already liked this
        if (partnerLikes.has(currentShow.id)) {
          setMatchedShow(currentShow);
          setMatches((prev) => [...prev, currentShow]);
        }
      }

      setCurrentIndex((prev) => prev + 1);
    },
    [currentShow, sessionId, player, partnerLikes]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center">
            <span className="text-sm font-semibold text-muted-foreground">
              {player === 1 ? "💜" : "🧡"} Partner {player}
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
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
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
