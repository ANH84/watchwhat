import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Users } from "lucide-react";
import ShowCard from "@/components/ShowCard";
import MatchReveal from "@/components/MatchReveal";
import { sampleShows, Show } from "@/data/shows";

type Player = "partner1" | "partner2";

const SwipePage = ({ onBack }: { onBack: () => void }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("partner1");
  const [currentIndex, setCurrentIndex] = useState<Record<Player, number>>({
    partner1: 0,
    partner2: 0,
  });
  const [likes, setLikes] = useState<Record<Player, Set<string>>>({
    partner1: new Set(),
    partner2: new Set(),
  });
  const [matchedShow, setMatchedShow] = useState<Show | null>(null);
  const [matches, setMatches] = useState<Show[]>([]);

  const shows = sampleShows;
  const currentShow = shows[currentIndex[currentPlayer]];
  const isDone = currentIndex[currentPlayer] >= shows.length;

  const otherPlayer = currentPlayer === "partner1" ? "partner2" : "partner1";
  const bothDone = currentIndex.partner1 >= shows.length && currentIndex.partner2 >= shows.length;

  const handleVote = (liked: boolean) => {
    if (!currentShow) return;

    if (liked) {
      const newLikes = new Set(likes[currentPlayer]);
      newLikes.add(currentShow.id);
      setLikes((prev) => ({ ...prev, [currentPlayer]: newLikes }));

      // Check for match
      if (likes[otherPlayer].has(currentShow.id)) {
        setMatchedShow(currentShow);
        setMatches((prev) => [...prev, currentShow]);
      }
    }

    setCurrentIndex((prev) => ({
      ...prev,
      [currentPlayer]: prev[currentPlayer] + 1,
    }));
  };

  const playerLabel = currentPlayer === "partner1" ? "Partner 1" : "Partner 2";
  const playerEmoji = currentPlayer === "partner1" ? "💜" : "🧡";

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
              {playerEmoji} {playerLabel}'s turn
            </span>
            <div className="text-xs text-muted-foreground">
              {currentIndex[currentPlayer]} / {shows.length}
            </div>
          </div>
          <button
            onClick={() => setCurrentPlayer(otherPlayer)}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Switch
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {bothDone ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h2 className="text-3xl font-display font-bold text-gradient mb-4">
              All Done! 🎬
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
              <p className="text-muted-foreground">
                No matches this time. Try again with different shows! 😅
              </p>
            )}
            <button
              onClick={onBack}
              className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Start Over
            </button>
          </motion.div>
        ) : isDone ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              {playerLabel} is done!
            </h2>
            <p className="text-muted-foreground mb-6">
              Pass the phone to your partner to continue.
            </p>
            <button
              onClick={() => setCurrentPlayer(otherPlayer)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Switch to {otherPlayer === "partner1" ? "Partner 1" : "Partner 2"}
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <ShowCard
              key={currentShow.id + currentPlayer}
              show={currentShow}
              onLike={() => handleVote(true)}
              onSkip={() => handleVote(false)}
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
