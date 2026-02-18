import { motion } from "framer-motion";
import { Heart, X, Star, Tv } from "lucide-react";
import { Show } from "@/data/shows";

interface ShowCardProps {
  show: Show;
  onLike: () => void;
  onSkip: () => void;
}

const ShowCard = ({ show, onLike, onSkip }: ShowCardProps) => {
  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border">
        {/* Poster */}
        <div className="relative h-[400px] overflow-hidden">
          <img
            src={show.poster}
            alt={show.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
          
          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary/90 px-2.5 py-0.5 rounded-full text-xs font-semibold text-primary-foreground">
                {show.platform}
              </span>
              <span className="flex items-center gap-1 bg-secondary/90 px-2.5 py-0.5 rounded-full text-xs font-semibold text-secondary-foreground">
                <Star className="w-3 h-3" />
                {show.rating}
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-primary-foreground drop-shadow-lg">
              {show.title}
            </h3>
            <p className="text-sm text-primary-foreground/80 mt-0.5">
              {show.year} · {show.genre.join(", ")}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="p-5">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {show.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-6 px-5 pb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSkip}
            className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shadow-md hover:bg-destructive/10 transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLike}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <Heart className="w-7 h-7 text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ShowCard;
