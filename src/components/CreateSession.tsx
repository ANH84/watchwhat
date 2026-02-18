import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, MessageCircle, Check, Loader2 } from "lucide-react";
import { createSession, getShareUrl, getWhatsAppShareUrl } from "@/lib/session";

interface CreateSessionProps {
  onSessionCreated: (sessionId: string, code: string) => void;
}

const CreateSession = ({ onSessionCreated }: CreateSessionProps) => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ id: string; code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const s = await createSession();
      setSession(s);
    } catch {
      // retry once
      const s = await createSession();
      setSession(s);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!session) return;
    await navigator.clipboard.writeText(getShareUrl(session.code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!session) return;
    window.open(getWhatsAppShareUrl(session.code), "_blank");
  };

  const handleStart = () => {
    if (!session) return;
    onSessionCreated(session.id, session.code);
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {!session ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            "Create a Session"
          )}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Session code display */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
            <p className="text-sm text-muted-foreground mb-2">Your session code</p>
            <div className="text-4xl font-display font-bold tracking-[0.3em] text-foreground">
              {session.code}
            </div>
          </div>

          {/* Share options */}
          <p className="text-muted-foreground text-sm">
            Share this with your partner so they can join:
          </p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(142,70%,45%)] text-primary-foreground font-semibold shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-foreground font-semibold"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? "Copied!" : "Copy Link"}
            </motion.button>
          </div>

          {/* Start swiping */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Start Swiping 🎬
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default CreateSession;
