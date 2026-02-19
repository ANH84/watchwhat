import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, CreditCard, Share2, Copy, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const ALL_GENRES = [
  "Action", "Adventure", "Animation", "Bollywood", "Arabic", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Kids",
  "Music", "Mystery", "News", "Reality", "Romance", "Sci-Fi & Fantasy",
  "Science Fiction", "Thriller", "War", "Western",
];

interface SettingsPageProps {
  leadEmail: string;
  onBack: () => void;
}

const SettingsPage = ({ leadEmail, onBack }: SettingsPageProps) => {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteGenre, setFavoriteGenre] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Card form
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({ holder: "", number: "", expiry: "", cvv: "" });

  // Referral
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      const { data } = await supabase
        .from("leads")
        .select()
        .eq("email", leadEmail.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLead(data);
        setFavoriteGenre(data.favorite_genre || "");

        // Generate referral code if not present
        if (!data.referral_code) {
          const code = generateReferralCode();
          await supabase
            .from("leads")
            .update({ referral_code: code })
            .eq("id", data.id);
          setLead({ ...data, referral_code: code });
        }
      }
      setLoading(false);
    };
    fetchLead();
  }, [leadEmail]);

  const generateReferralCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "REF-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSaveGenre = async () => {
    if (!lead) return;
    setSaving(true);
    await supabase
      .from("leads")
      .update({ favorite_genre: favoriteGenre })
      .eq("id", lead.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveCard = async () => {
    if (!lead || !cardForm.number || !cardForm.holder) return;
    const lastFour = cardForm.number.replace(/\s/g, "").slice(-4);
    await supabase
      .from("leads")
      .update({ card_last_four: lastFour, card_holder_name: cardForm.holder.trim() })
      .eq("id", lead.id);
    setLead({ ...lead, card_last_four: lastFour, card_holder_name: cardForm.holder.trim() });
    setShowCardForm(false);
    setCardForm({ holder: "", number: "", expiry: "", cvv: "" });
  };

  const referralLink = lead?.referral_code
    ? `${window.location.origin}?ref=${lead.referral_code}`
    : "";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!lead?.referral_code) return;
    const shareData = {
      title: "Join WatchWhat?",
      text: `🎬 Join me on WatchWhat? and find your next binge together! Use my code: ${lead.referral_code}`,
      url: referralLink,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      handleCopy(referralLink);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground">Settings</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Profile Info */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Your Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <p className="text-foreground font-medium">
                {lead?.first_name} {lead?.last_name}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <p className="text-foreground font-medium">{lead?.email}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mobile</label>
              <p className="text-foreground font-medium">{lead?.mobile}</p>
            </div>
          </div>
        </motion.section>

        {/* Favourite Genre */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-accent" />
            Favourite Genre
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setFavoriteGenre(g)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  favoriteGenre === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveGenre}
            disabled={saving || !favoriteGenre}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              "Save Preference"
            )}
          </motion.button>
        </motion.section>

        {/* Payment Card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-secondary" />
            Payment Card
          </h2>

          {lead?.card_last_four && !showCardForm ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-primary/80 to-accent/80 rounded-xl p-5 text-primary-foreground relative overflow-hidden">
                <div className="absolute top-3 right-4 opacity-30">
                  <CreditCard className="w-10 h-10" />
                </div>
                <p className="text-xs opacity-70 mb-4">Card on file</p>
                <p className="font-mono text-lg tracking-widest mb-3">
                  •••• •••• •••• {lead.card_last_four}
                </p>
                <p className="text-sm font-medium">{lead.card_holder_name}</p>
              </div>
              <button
                onClick={() => setShowCardForm(true)}
                className="text-sm text-primary font-medium hover:underline"
              >
                Update card
              </button>
            </div>
          ) : showCardForm ? (
            <div className="space-y-3">
              <Input
                placeholder="Cardholder name"
                value={cardForm.holder}
                onChange={(e) => setCardForm((p) => ({ ...p, holder: e.target.value }))}
                maxLength={100}
              />
              <Input
                placeholder="Card number"
                value={cardForm.number}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = v.replace(/(.{4})/g, "$1 ").trim();
                  setCardForm((p) => ({ ...p, number: formatted }));
                }}
                maxLength={19}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="MM/YY"
                  value={cardForm.expiry}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                    setCardForm((p) => ({ ...p, expiry: v }));
                  }}
                  maxLength={5}
                />
                <Input
                  placeholder="CVV"
                  type="password"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  maxLength={4}
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveCard}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  Save Card
                </motion.button>
                <button
                  onClick={() => setShowCardForm(false)}
                  className="p-3 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCardForm(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm hover:border-primary/40 hover:text-foreground transition-colors"
            >
              + Add Payment Card
            </motion.button>
          )}
        </motion.section>

        {/* Referral / Invite */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Invite Friends
          </h2>

          {lead?.referral_code && (
            <>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Your referral code</p>
                <div className="bg-muted rounded-xl py-3 px-4 flex items-center justify-center gap-3">
                  <span className="font-mono font-bold text-xl tracking-[0.2em] text-foreground">
                    {lead.referral_code}
                  </span>
                  <button
                    onClick={() => handleCopy(lead.referral_code)}
                    className="p-1.5 rounded-lg hover:bg-background transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl py-2 px-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground truncate flex-1">{referralLink}</span>
                <button
                  onClick={() => handleCopy(referralLink)}
                  className="text-xs text-primary font-medium shrink-0"
                >
                  Copy
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Invitation
              </motion.button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{lead.referral_count || 0}</span> friends joined with your code
                </p>
              </div>
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default SettingsPage;
