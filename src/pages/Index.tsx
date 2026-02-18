import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Tv, Sparkles, ArrowRight, Users, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-couple.png";
import SwipePage from "@/components/SwipePage";
import CreateSession from "@/components/CreateSession";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import { saveLocalSession, loadLocalSession, clearLocalSession } from "@/lib/session";

const Index = () => {
  const [sessionInfo, setSessionInfo] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = loadLocalSession();
    if (stored && stored.player === 1) {
      setSessionInfo({ id: stored.id, code: stored.code });
      setLeadCaptured(stored.leadCaptured);
    }
  }, []);

  const handleSessionCreated = (id: string, code: string) => {
    setSessionInfo({ id, code });
    saveLocalSession({ id, code, player: 1, leadCaptured: false });
  };

  const handleLeadComplete = () => {
    setLeadCaptured(true);
    if (sessionInfo) {
      saveLocalSession({ id: sessionInfo.id, code: sessionInfo.code, player: 1, leadCaptured: true });
    }
  };

  const handleBack = () => {
    setSessionInfo(null);
    setShowCreate(false);
    setLeadCaptured(false);
    clearLocalSession();
  };

  if (sessionInfo && leadCaptured) {
    return (
      <SwipePage
        sessionId={sessionInfo.id}
        sessionCode={sessionInfo.code}
        player={1}
        onBack={handleBack}
      />
    );
  }

  if (sessionInfo && !leadCaptured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Tv className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">WatchTogether</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center">
            Almost there!
          </h2>
          <LeadCaptureForm
            sessionId={sessionInfo.id}
            onComplete={handleLeadComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Tv className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">WatchTogether</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-20">
        {showCreate ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <button
              onClick={() => setShowCreate(false)}
              className="text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2 text-center">
              Start a session
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Create a session and share the link with your partner via WhatsApp
            </p>
            <CreateSession
              onSessionCreated={handleSessionCreated}
            />
          </motion.div>
        ) : (
          <>
            {/* Hero */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    No more "what should we watch?"
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                  Find your next
                  <span className="text-gradient block">binge together</span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                  Create a session, share the link with your partner, and both swipe on shows
                  whenever you have a moment. When you match — it's movie night! 🍿
                </p>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  Start a Session
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                {/* Stats */}
                <div className="flex items-center gap-8 mt-10">
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground flex items-center gap-1">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Share
                    </div>
                    <div className="text-sm text-muted-foreground">Via WhatsApp</div>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground flex items-center gap-1">
                      <Heart className="w-5 h-5 text-accent" />
                      Match
                    </div>
                    <div className="text-sm text-muted-foreground">Swipe anytime</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={heroImage}
                    alt="Couple watching TV together on a cozy sofa with popcorn"
                    className="w-full h-auto"
                  />
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-4 bg-card px-4 py-3 rounded-xl shadow-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-accent" />
                    <span className="font-display font-bold text-sm text-card-foreground">
                      It's a Match!
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* How it works */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-28"
            >
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-12">
                How it works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "📱",
                    title: "Create a session",
                    desc: "Tap 'Start a Session' to generate a unique code and shareable link.",
                  },
                  {
                    icon: "💬",
                    title: "Share via WhatsApp",
                    desc: "Send the link to your partner. They open it and join instantly.",
                  },
                  {
                    icon: "🎉",
                    title: "Swipe & Match",
                    desc: "Both swipe on your own time. When you both ❤️ a show — it's a match!",
                  },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow text-center"
                  >
                    <div className="text-3xl mb-4">{step.icon}</div>
                    <h3 className="font-display font-bold text-lg text-card-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
