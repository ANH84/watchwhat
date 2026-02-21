import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Tv, Sparkles, ArrowRight, Users, MessageCircle, User, UserRound, Settings, LogIn, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-couple.png";
import SwipePage from "@/components/SwipePage";
import CreateSession from "@/components/CreateSession";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import FilterScreen, { FilterSelections } from "@/components/FilterScreen";
import SettingsPage from "@/components/SettingsPage";
import WatchlistPage from "@/pages/WatchlistPage";
import { createSession as createSessionApi, joinSession, saveLocalSession, loadLocalSession, clearLocalSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { TmdbFilters } from "@/hooks/useTmdbShows";

type GameMode = "solo" | "multi" | null;

const Index = () => {
  const [sessionInfo, setSessionInfo] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerLeadId, setPlayerLeadId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showMultiFilters, setShowMultiFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<TmdbFilters | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [playerRole, setPlayerRole] = useState<1 | 2>(1);

  // Restore session from localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasRefCode = !!urlParams.get("ref");

    // If arriving via referral link, skip session restore and show signup
    if (hasRefCode) {
      setShowLeadCapture(true);
      return;
    }

    const stored = loadLocalSession();
    if (stored && stored.player === 1) {
      setSessionInfo({ id: stored.id, code: stored.code });
      setLeadCaptured(stored.leadCaptured);
      setPlayerName(stored.firstName || "");
      setPlayerEmail(stored.email || "");
      setGameMode(stored.mode || null);
      if (stored.leadId) setPlayerLeadId(stored.leadId);
      setIsNewUser(false);
    }
  }, []);

  const handleSessionCreated = async (id: string, code: string) => {
    // For multi mode, save filters to session in DB
    if (pendingFilters) {
      await (supabase.from("sessions") as any)
        .update({ filters: pendingFilters })
        .eq("id", id);
    }
    setSessionInfo({ id, code });
    saveLocalSession({ id, code, player: 1, leadCaptured: true, firstName: playerName, email: playerEmail, mode: "multi", leadId: playerLeadId });
  };

  const handleLeadComplete = async (firstName: string, email?: string, leadId?: string, isReturning?: boolean) => {
    setLeadCaptured(true);
    setShowLeadCapture(false);
    setShowSettings(false);
    setShowWatchlist(false);
    setGameMode(null);
    setPlayerName(firstName);
    setIsNewUser(!isReturning);
    if (email) setPlayerEmail(email);
    if (leadId) setPlayerLeadId(leadId);
    // Save a basic local session so user stays logged in
    saveLocalSession({
      id: "",
      code: "",
      player: 1,
      leadCaptured: true,
      firstName,
      email,
      mode: undefined,
      leadId,
    });
  };

  const handleStartSolo = async () => {
    setGameMode("solo");
    try {
      const session = await createSessionApi("solo", playerLeadId || undefined);
      setSessionInfo({ id: session.id, code: session.code });
      saveLocalSession({
        id: session.id,
        code: session.code,
        player: 1,
        leadCaptured: true,
        firstName: playerName,
        email: playerEmail,
        mode: "solo",
        leadId: playerLeadId,
      });
    } catch {
      // fallback
    }
  };

  const handleStartMulti = () => {
    setGameMode("multi");
    setShowMultiFilters(true);
  };

  const handleMultiFiltersApplied = (selections: FilterSelections) => {
    const filters: TmdbFilters = {
      mediaType: selections.mediaType,
      providers: selections.providers,
      genres: selections.genres,
      languages: selections.languages,
    };
    setPendingFilters(filters);
    setShowMultiFilters(false);
    setShowCreate(true);
  };

  const handleJoinByCode = async () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (!trimmed) return;
    setJoinError("");
    setJoinLoading(true);
    try {
      const s = await joinSession(trimmed);
      if (s) {
        setSessionInfo(s);
        setGameMode("multi");
        setPlayerRole(2);
        saveLocalSession({ id: s.id, code: s.code, player: 2, leadCaptured: true, firstName: playerName, email: playerEmail, mode: "multi", leadId: playerLeadId });
      } else {
        setJoinError("Session not found. Check the code and try again.");
      }
    } catch {
      setJoinError("Something went wrong. Try again.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleBack = () => {
    setSessionInfo(null);
    setShowCreate(false);
    setShowMultiFilters(false);
    setPendingFilters(null);
    setGameMode(null);
    setPlayerRole(1);
    setJoinCode("");
    setJoinError("");
    // Don't clear lead info — user stays "logged in"
  };

  const handleLogout = () => {
    setSessionInfo(null);
    setShowCreate(false);
    setLeadCaptured(false);
    setPlayerName("");
    setPlayerEmail("");
    setPlayerLeadId("");
    setGameMode(null);
    setShowLeadCapture(false);
    clearLocalSession();
  };

  // --- Subscreen renders ---

  if (showWatchlist && playerEmail) {
    return <WatchlistPage leadEmail={playerEmail} onBack={() => setShowWatchlist(false)} />;
  }

  if (showSettings && playerEmail) {
    return (
      <SettingsPage
        leadEmail={playerEmail}
        onBack={() => setShowSettings(false)}
        onOpenWatchlist={() => { setShowSettings(false); setShowWatchlist(true); }}
        onLogout={handleLogout}
        onHome={() => { setShowSettings(false); setGameMode(null); }}
      />
    );
  }

  // Mode selection takes priority — never skip this for users without an active game
  if (leadCaptured && !gameMode && !showCreate) {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Tv className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">WatchWhat?</span>
          </div>
          <div className="flex items-center gap-2">
            {playerEmail && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </nav>

        <main className="max-w-md mx-auto px-6 pt-12 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              {isNewUser ? `Hey ${playerName}! 🎬` : `Welcome back, ${playerName}! 👋`}
            </h2>
            <p className="text-muted-foreground mb-10">
              {isNewUser ? "Pick a mode to start swiping" : "What would you like to do?"}
            </p>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartSolo}
                className="w-full flex items-center gap-4 bg-card border-2 border-border text-foreground px-6 py-5 rounded-2xl font-display font-bold text-lg shadow-md hover:shadow-lg hover:border-primary/50 transition-all text-left"
              >
                <div className="p-3 rounded-xl bg-primary/10">
                  <UserRound className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="block">Play Solo</span>
                  <span className="text-sm font-normal text-muted-foreground">Build your personal watchlist</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartMulti}
                className="w-full flex items-center gap-4 bg-primary text-primary-foreground px-6 py-5 rounded-2xl font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow text-left"
              >
                <div className="p-3 rounded-xl bg-primary-foreground/20">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="block">Play Together</span>
                  <span className="text-sm font-normal opacity-80">Match shows with your partner</span>
                </div>
              </motion.button>

              {/* Join a session by code */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground">or join a game</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
                  placeholder="Enter game code"
                  maxLength={10}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground font-mono text-center tracking-widest text-lg placeholder:text-muted-foreground placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleJoinByCode}
                  disabled={!joinCode.trim() || joinLoading}
                  className="px-5 py-3 rounded-xl bg-accent text-accent-foreground font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {joinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Join
                </motion.button>
              </div>
              {joinError && (
                <p className="text-destructive text-sm mt-1">{joinError}</p>
              )}


              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Active game
  if (sessionInfo && sessionInfo.id && leadCaptured && gameMode) {
    return (
      <SwipePage
        sessionId={sessionInfo.id}
        sessionCode={sessionInfo.code}
        player={playerRole}
        playerName={playerName}
        onBack={handleBack}
        onOpenSettings={playerEmail ? () => setShowSettings(true) : undefined}
        mode={gameMode}
        initialFilters={gameMode === "multi" ? pendingFilters : undefined}
      />
    );
  }

  // Multi: filter screen (before session creation)
  if (gameMode === "multi" && showMultiFilters && leadCaptured) {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
            <button onClick={handleBack} className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-muted transition-colors">
              <Tv className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-sm text-foreground">WatchWhat?</span>
            </button>
            {playerEmail ? (
              <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <User className="w-5 h-5 text-muted-foreground" />
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
        <FilterScreen onApply={handleMultiFiltersApplied} />
      </div>
    );
  }

  // Multi: create session screen
  if (gameMode === "multi" && showCreate && leadCaptured) {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Tv className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">WatchWhat?</span>
          </div>
          {playerEmail && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </nav>
        <main className="max-w-5xl mx-auto px-6 pt-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <button
              onClick={handleBack}
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
            <CreateSession onSessionCreated={handleSessionCreated} />
          </motion.div>
        </main>
      </div>
    );
  }

  // Lead capture screen (before mode selection)
  if (showLeadCapture && !leadCaptured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Tv className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">WatchWhat?</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center">
            Let's get started 🎬
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Sign up or log back in to start swiping
          </p>
          <LeadCaptureForm
            sessionId="solo-pending"
            onComplete={handleLeadComplete}
          />
          <button
            onClick={() => setShowLeadCapture(false)}
            className="w-full text-center text-muted-foreground text-sm mt-4 hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }



  // Landing page (not logged in)
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Tv className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">WatchWhat?</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-20">
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
              Swipe solo to build your personal watchlist, or play together and match on your next binge! 🍿
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLeadCapture(true)}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-2">
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
                title: "Sign up",
                desc: "Create your account in seconds — new users or returning, we've got you.",
              },
              {
                icon: "🎮",
                title: "Choose your mode",
                desc: "Play solo to build your watchlist, or start a multiplayer session with your partner.",
              },
              {
                icon: "🎉",
                title: "Swipe & Match",
                desc: "Swipe on shows you love. In multiplayer, when you both ❤️ a show — it's a match!",
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
      </main>
    </div>
  );
};

export default Index;
