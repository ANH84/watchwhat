import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Moon, Loader2, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTmdbShows } from "@/hooks/useTmdbShows";

interface WatchlistPageProps {
  leadEmail: string;
  onBack: () => void;
}

interface VoteRecord {
  show_id: string;
  vote_type: string;
  created_at: string;
}

const WatchlistPage = ({ leadEmail, onBack }: WatchlistPageProps) => {
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [notTonightIds, setNotTonightIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"liked" | "not_tonight">("liked");

  // We use a broad TMDB fetch to resolve show details — fetch all show IDs we need
  const allIds = [...new Set([...likedIds, ...notTonightIds])];

  useEffect(() => {
    const fetchVotes = async () => {
      // Find lead's solo sessions
      const { data: leads } = await supabase
        .from("leads")
        .select("id")
        .eq("email", leadEmail.toLowerCase());

      if (!leads || leads.length === 0) {
        setLoading(false);
        return;
      }

      const leadIdList = leads.map((l) => l.id);

      // Get solo sessions for this user
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("mode", "solo")
        .in("lead_id", leadIdList);

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      const sessionIds = sessions.map((s) => s.id);

      // Get all votes from those sessions
      const { data: votes } = await supabase
        .from("votes")
        .select("show_id, vote_type, created_at")
        .in("session_id", sessionIds);

      if (votes) {
        const liked: string[] = [];
        const notTonight: string[] = [];
        votes.forEach((v: VoteRecord) => {
          if (v.vote_type === "liked") liked.push(v.show_id);
          else if (v.vote_type === "not_tonight") notTonight.push(v.show_id);
        });
        setLikedIds([...new Set(liked)]);
        setNotTonightIds([...new Set(notTonight)]);
      }
      setLoading(false);
    };
    fetchVotes();
  }, [leadEmail]);

  const currentIds = activeTab === "liked" ? likedIds : notTonightIds;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground">My Watchlist</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          <button
            onClick={() => setActiveTab("liked")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "liked"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Heart className="w-4 h-4" />
            Liked ({likedIds.length})
          </button>
          <button
            onClick={() => setActiveTab("not_tonight")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "not_tonight"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Moon className="w-4 h-4" />
            Not Tonight ({notTonightIds.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your watchlist...</p>
          </div>
        ) : currentIds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Tv className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {activeTab === "liked"
                ? "No liked shows yet. Start swiping in Solo mode!"
                : "No 'Not Tonight' shows yet."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {currentIds.map((showId) => (
              <ShowListItem key={showId} showId={showId} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Simple component to display a show by its TMDB ID
const ShowListItem = ({ showId }: { showId: string }) => {
  const [show, setShow] = useState<any>(null);

  useEffect(() => {
    // Parse show ID format: "tv-12345" or "movie-12345"
    const parts = showId.match(/^(tv|movie)-(.+)$/);
    if (!parts) return;
    const mediaType = parts[1];
    const tmdbId = parts[2];

    const fetchShow = async () => {
      try {
        const { data } = await supabase.functions.invoke("tmdb-shows", {
          body: { action: "details", mediaType, tmdbId },
        });
        if (data) setShow(data);
      } catch {
        // silently fail
      }
    };
    fetchShow();
  }, [showId]);

  if (!show) {
    return (
      <div className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border animate-pulse">
        <div className="w-14 h-20 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  const title = show.title || show.name || "Unknown";
  const year = (show.release_date || show.first_air_date || "").slice(0, 4);
  const poster = show.poster_path
    ? `https://image.tmdb.org/t/p/w200${show.poster_path}`
    : "/placeholder.svg";

  return (
    <div className="bg-card rounded-xl p-4 flex items-center gap-4 border border-border shadow-sm">
      <img
        src={poster}
        alt={title}
        className="w-14 h-20 rounded-lg object-cover"
        onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
      />
      <div className="text-left flex-1">
        <h4 className="font-display font-bold text-card-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{year}</p>
      </div>
    </div>
  );
};

export default WatchlistPage;
