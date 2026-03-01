import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Show } from "@/data/shows";

interface RandomSelectorProps {
  matches: Show[];
  onSelected: (show: Show) => void;
}

// Generate Fibonacci numbers +1, up to a reasonable limit
function getFibonacciPlusOne(max: number): number[] {
  const fibs: number[] = [];
  let a = 1, b = 1;
  while (a + 1 <= max) {
    fibs.push(a + 1); // +1
    const next = a + b;
    a = b;
    b = next;
  }
  if (b + 1 <= max) fibs.push(b + 1);
  return fibs;
}

const RandomSelector = ({ matches, onSelected }: RandomSelectorProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  const startSelection = useCallback(() => {
    if (matches.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedShow(null);

    // Pick a random Fibonacci+1 number to determine total steps
    const fibNumbers = getFibonacciPlusOne(100);
    const totalSteps = fibNumbers[Math.floor(Math.random() * fibNumbers.length)];

    // The final index after cycling through all matches
    const finalIndex = (totalSteps - 1) % matches.length;

    let step = 0;
    const baseDelay = 80;

    const animate = () => {
      const currentIdx = step % matches.length;
      setHighlightIndex(currentIdx);
      step++;

      if (step <= totalSteps) {
        // Slow down towards the end
        const progress = step / totalSteps;
        const delay = baseDelay + progress * progress * 400;
        setTimeout(animate, delay);
      } else {
        // Done — reveal the selected show
        setHighlightIndex(finalIndex);
        setTimeout(() => {
          setSelectedShow(matches[finalIndex]);
          setIsSpinning(false);
        }, 600);
      }
    };

    animate();
  }, [matches, isSpinning]);

  return (
    <div className="mt-8">
      {!selectedShow && !isSpinning && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSelection}
          className="mx-auto flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          <Sparkles className="w-5 h-5" />
          Choose for us
        </motion.button>
      )}

      {(isSpinning || selectedShow) && (
        <div className="space-y-2 mt-4">
          {matches.map((show, idx) => {
            const isHighlighted = highlightIndex === idx;
            const isWinner = selectedShow?.id === show.id;

            return (
              <motion.div
                key={show.id}
                animate={{
                  scale: isWinner ? 1.05 : isHighlighted ? 1.02 : 1,
                  borderColor: isWinner
                    ? "hsl(var(--primary))"
                    : isHighlighted
                    ? "hsl(var(--primary) / 0.6)"
                    : "hsl(var(--border))",
                  backgroundColor: isWinner
                    ? "hsl(var(--primary) / 0.15)"
                    : isHighlighted
                    ? "hsl(var(--primary) / 0.07)"
                    : "hsl(var(--card))",
                }}
                transition={{ duration: 0.1 }}
                className="rounded-xl p-4 flex items-center gap-4 border-2 shadow-sm"
              >
                <img
                  src={show.poster}
                  alt={show.title}
                  className="w-14 h-20 rounded-lg object-cover"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
                <div className="text-left flex-1">
                  <h4 className="font-display font-bold text-card-foreground">{show.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {show.platform} · {show.year}
                  </p>
                </div>
                {isWinner && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    🎉
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedShow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6"
          >
            <p className="text-lg font-display font-bold text-primary">
              Tonight you're watching: {selectedShow.title} 🍿
            </p>
            <button
              onClick={() => { setSelectedShow(null); setHighlightIndex(null); }}
              className="mt-3 text-sm text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Spin again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RandomSelector;
