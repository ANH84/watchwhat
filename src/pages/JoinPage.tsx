import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tv, Loader2 } from "lucide-react";
import { joinSession, saveLocalSession, loadLocalSession, clearLocalSession } from "@/lib/session";
import SwipePage from "@/components/SwipePage";
import LeadCaptureForm from "@/components/LeadCaptureForm";

const JoinPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<{ id: string; code: string } | null>(null);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [playerName, setPlayerName] = useState("");

  // Restore from localStorage if same session
  useEffect(() => {
    const stored = loadLocalSession();
    if (stored && stored.player === 2 && code && stored.code === code.toUpperCase().trim()) {
      setSession({ id: stored.id, code: stored.code });
      setLeadCaptured(stored.leadCaptured);
      setPlayerName(stored.firstName || "");
      if (stored.leadCaptured) {
        setShowForm(true);
      }
      setLoading(false);
      return;
    }

    const tryJoin = async () => {
      if (!code) {
        setError(true);
        setLoading(false);
        return;
      }
      const s = await joinSession(code);
      if (s) {
        setSession(s);
      } else {
        setError(true);
      }
      setLoading(false);
    };
    tryJoin();
  }, [code]);

  const handleLeadComplete = (firstName: string) => {
    setLeadCaptured(true);
    setPlayerName(firstName);
    if (session) {
      saveLocalSession({ id: session.id, code: session.code, player: 2, leadCaptured: true, firstName });
    }
  };

  const handleJoinClick = () => {
    setShowForm(true);
    if (session) {
      saveLocalSession({ id: session.id, code: session.code, player: 2, leadCaptured: false });
    }
  };

  if (leadCaptured && session) {
    return (
      <SwipePage
        sessionId={session.id}
        sessionCode={session.code}
        player={2}
        playerName={playerName}
        onBack={() => {
          clearLocalSession();
          navigate("/");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Tv className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">WatchWhat?</span>
        </div>

        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-foreground font-display font-bold text-xl mb-2">
              Session not found 😕
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              This link may have expired or the code is incorrect.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
            >
              Go Home
            </button>
          </motion.div>
        ) : session && showForm && !leadCaptured ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Almost there!
            </h2>
            <LeadCaptureForm
              sessionId={session.id}
              onComplete={handleLeadComplete}
            />
          </motion.div>
        ) : session ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-muted-foreground mb-2">You've been invited to</p>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-md mb-6">
              <p className="text-sm text-muted-foreground mb-1">Session</p>
              <div className="text-3xl font-display font-bold tracking-[0.3em] text-foreground">
                {session.code}
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Swipe on shows at your own pace. When you both ❤️ the same show, it's a match!
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleJoinClick}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg"
            >
              Join & Start Swiping 🎬
            </motion.button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default JoinPage;
