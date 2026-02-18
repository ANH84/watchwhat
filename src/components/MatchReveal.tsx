import { motion } from "framer-motion";
import { Heart, Sparkles, Tv } from "lucide-react";
import { Show } from "@/data/shows";

interface MatchRevealProps {
  show: Show;
  onContinue: () => void;
}

const MatchReveal = ({ show, onContinue }: MatchRevealProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-card rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-border"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Sparkles className="w-12 h-12 text-secondary mx-auto mb-4" />
        </motion.div>
        
        <h2 className="text-3xl font-display font-bold text-gradient mb-2">
          It's a Match!
        </h2>
        <p className="text-muted-foreground mb-6">
          You both want to watch this one! 🎉
        </p>

        <div className="rounded-xl overflow-hidden mb-6 shadow-lg">
          <img
            src={show.poster}
            alt={show.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="bg-muted p-4">
            <h3 className="font-display font-bold text-lg text-card-foreground">{show.title}</h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <Tv className="w-4 h-4" />
              {show.platform} · {show.year}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
        >
          Keep Swiping
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default MatchReveal;
