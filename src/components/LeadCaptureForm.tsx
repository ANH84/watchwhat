import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const COUNTRY_CODES = [
  { code: "+971", label: "🇦🇪 UAE +971" },
  { code: "+966", label: "🇸🇦 Saudi Arabia +966" },
  { code: "+20", label: "🇪🇬 Egypt +20" },
  { code: "+44", label: "🇬🇧 UK +44" },
  { code: "+1", label: "🇺🇸 US +1" },
  { code: "+91", label: "🇮🇳 India +91" },
  { code: "+973", label: "🇧🇭 Bahrain +973" },
  { code: "+968", label: "🇴🇲 Oman +968" },
  { code: "+974", label: "🇶🇦 Qatar +974" },
  { code: "+965", label: "🇰🇼 Kuwait +965" },
  { code: "+962", label: "🇯🇴 Jordan +962" },
  { code: "+961", label: "🇱🇧 Lebanon +961" },
  { code: "+92", label: "🇵🇰 Pakistan +92" },
  { code: "+63", label: "🇵🇭 Philippines +63" },
  { code: "+27", label: "🇿🇦 South Africa +27" },
  { code: "+49", label: "🇩🇪 Germany +49" },
  { code: "+33", label: "🇫🇷 France +33" },
];

interface LeadCaptureFormProps {
  sessionId: string;
  onComplete: (firstName: string, email?: string) => void;
}

const LeadCaptureForm = ({ sessionId, onComplete }: LeadCaptureFormProps) => {
  const [isReturning, setIsReturning] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code: "+971",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email required";

    if (!isReturning) {
      if (!form.first_name.trim()) errs.first_name = "Required";
      if (!form.last_name.trim()) errs.last_name = "Required";
      if (!form.mobile.trim() || form.mobile.trim().length < 7)
        errs.mobile = "Valid mobile number required";
    }
    return errs;
  };

  const handleReturningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const email = form.email.trim().toLowerCase();
      const { data } = await supabase
        .from("leads")
        .select()
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (!data) {
        setErrors({ email: "Email not found. Please sign up as a new user." });
        setLoading(false);
        return;
      }

      // Link this lead to the current session by inserting a new lead record
      await supabase.from("leads").insert({
        session_id: sessionId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        mobile: data.mobile,
      });

      onComplete(data.first_name, data.email);
    } catch {
      onComplete("Friend", "");
    }
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();

      // Check for referral code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");

      const insertData: any = {
        session_id: sessionId,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email,
        mobile: `${form.country_code}${form.mobile.trim()}`,
      };

      if (refCode) {
        insertData.referred_by = refCode.toUpperCase();
      }

      await supabase.from("leads").insert(insertData);

      // Increment referral count for the referrer
      if (refCode) {
        const { data: referrer } = await supabase
          .from("leads")
          .select("id, referral_count")
          .eq("referral_code", refCode.toUpperCase())
          .limit(1)
          .maybeSingle();

        if (referrer) {
          await supabase
            .from("leads")
            .update({ referral_count: (referrer.referral_count || 0) + 1 })
            .eq("id", referrer.id);
        }
      }

      onComplete(form.first_name.trim(), email);
    } catch {
      onComplete(form.first_name.trim() || "Friend", form.email.trim().toLowerCase());
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-sm mx-auto"
    >
      {/* Toggle between new / returning */}
      <div className="flex rounded-xl bg-muted p-1 mb-6">
        <button
          type="button"
          onClick={() => { setIsReturning(false); setErrors({}); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            !isReturning
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          New User
        </button>
        <button
          type="button"
          onClick={() => { setIsReturning(true); setErrors({}); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            isReturning
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Returning User
        </button>
      </div>

      {isReturning ? (
        <motion.form
          key="returning"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleReturningSubmit}
          className="space-y-4"
        >
          <p className="text-center text-muted-foreground text-sm mb-2">
            Welcome back! Enter your email to continue.
          </p>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              maxLength={255}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Continue 🎬"
            )}
          </motion.button>
        </motion.form>
      ) : (
        <motion.form
          key="new"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleNewSubmit}
          className="space-y-4"
        >
          <p className="text-center text-muted-foreground text-sm mb-2">
            Enter your details to get started
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="First name"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                maxLength={50}
                className={errors.first_name ? "border-destructive" : ""}
              />
              {errors.first_name && (
                <p className="text-xs text-destructive mt-1">{errors.first_name}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                maxLength={50}
                className={errors.last_name ? "border-destructive" : ""}
              />
              {errors.last_name && (
                <p className="text-xs text-destructive mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              maxLength={255}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex gap-2">
              <Select
                value={form.country_code}
                onValueChange={(val) => update("country_code", val)}
              >
                <SelectTrigger className="w-[130px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="tel"
                placeholder="Mobile number"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                maxLength={20}
                className={errors.mobile ? "border-destructive" : ""}
              />
            </div>
            {errors.mobile && (
              <p className="text-xs text-destructive mt-1">{errors.mobile}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Continue 🎬"
            )}
          </motion.button>
        </motion.form>
      )}
    </motion.div>
  );
};

export default LeadCaptureForm;
