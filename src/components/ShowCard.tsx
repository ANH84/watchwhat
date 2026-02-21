import { motion } from "framer-motion";
import { Heart, X, Star, Clock } from "lucide-react";
import { Show } from "@/data/shows";

interface ShowCardProps {
  show: Show;
  onLike: () => void;
  onSkip: () => void;
  onNotTonight: () => void;
  wasNotTonight?: boolean;
}

const ShowCard = ({ show, onLike, onSkip, onNotTonight, wasNotTonight }: ShowCardProps) => {
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

          {/* Previously interested badge */}
          {wasNotTonight && (
            <div className="absolute top-3 right-3 bg-secondary/90 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary-foreground" />
              <span className="text-xs font-semibold text-secondary-foreground">Previously interested</span>
            </div>
          )}
          
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

        {/* Description & Providers */}
        <div className="p-5 space-y-3">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {show.description}
          </p>

          {show.providers && show.providers.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Watch on:</span>
              {show.providers.slice(0, 4).map((p, i) => (
                <div key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                  {p.logo && (
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="w-4 h-4 rounded-sm object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <span className="text-xs font-medium text-foreground">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 px-5 pb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSkip}
            className="flex flex-col items-center gap-1"
            title="Not for me"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shadow-md hover:bg-destructive/10 transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Not for me</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotTonight}
            className="flex flex-col items-center gap-1"
            title="Not tonight"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shadow-md hover:bg-secondary/30 transition-colors">
              <Clock className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Maybe later</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLike}
            className="flex flex-col items-center gap-1"
            title="Yes!"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-[10px] text-primary font-semibold">Yes!</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ShowCard;
