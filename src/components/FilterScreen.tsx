import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Tv, Check, ArrowRight } from "lucide-react";

export interface FilterSelections {
  mediaType: "tv" | "movie";
  providers: number[];
  genres: number[];
  languages: string[];
}

const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXBGjLxOl.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg" },
  { id: 1899, name: "HBO Max", logo: "https://image.tmdb.org/t/p/w92/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/w92/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/w92/2E03IAZsX4ZaUqM7tXlctEPMGWS.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/w92/giwM8XX4V2AQb9vsoN7yti82tKK.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/w92/fi83B1ozBHMmFn84KnEUhodMnGp.jpg" },
  { id: 283, name: "Crunchyroll", logo: "https://image.tmdb.org/t/p/w92/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg" },
];

const LANGUAGE_FILTERS = [
  { code: "hi", name: "Bollywood" },
  { code: "ar", name: "Arabic" },
];

const GENRES_TV = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

const GENRES_MOVIE = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

interface FilterScreenProps {
  onApply: (filters: FilterSelections) => void;
}

const FilterScreen = ({ onApply }: FilterScreenProps) => {
  const [mediaType, setMediaType] = useState<"tv" | "movie">("tv");
  const [selectedProviders, setSelectedProviders] = useState<Set<number>>(new Set([8]));
  const [selectedGenres, setSelectedGenres] = useState<Set<number>>(new Set());
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set());

  const genres = mediaType === "tv" ? GENRES_TV : GENRES_MOVIE;

  const toggleProvider = (id: number) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleApply = () => {
    onApply({
      mediaType,
      providers: Array.from(selectedProviders),
      genres: Array.from(selectedGenres),
      languages: Array.from(selectedLanguages),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-4 py-8 space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          What are you in the mood for?
        </h2>
        <p className="text-muted-foreground">Pick your preferences and start swiping</p>
      </div>

      {/* Film or Series */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Type
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "tv" as const, label: "Series", icon: Tv },
            { value: "movie" as const, label: "Films", icon: Film },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setMediaType(opt.value);
                setSelectedGenres(new Set()); // Reset genres when switching type
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                mediaType === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              <opt.icon className="w-5 h-5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Streaming Platforms */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Streaming Platforms
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleProvider(p.id)}
              className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl border-2 transition-all text-left ${
                selectedProviders.has(p.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <img
                src={p.logo}
                alt={p.name}
                className="w-7 h-7 rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-sm font-medium text-foreground flex-1">{p.name}</span>
              {selectedProviders.has(p.id) && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Genres {selectedGenres.size === 0 && selectedLanguages.size === 0 && <span className="normal-case text-xs">(all if none selected)</span>}
        </h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedGenres.has(g.id)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Language / Regional Filters */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Regional
        </h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_FILTERS.map((l) => (
            <button
              key={l.code}
              onClick={() => toggleLanguage(l.code)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedLanguages.has(l.code)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Apply */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleApply}
        disabled={selectedProviders.size === 0}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Start Swiping
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default FilterScreen;
