import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface LeadCaptureFormProps {
  sessionId: string;
  onComplete: () => void;
}

const LeadCaptureForm = ({ sessionId, onComplete }: LeadCaptureFormProps) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.first_name.trim()) errs.first_name = "Required";
    if (!form.last_name.trim()) errs.last_name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Valid email required";
    if (!form.mobile.trim() || form.mobile.trim().length < 7)
      errs.mobile = "Valid mobile number required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await supabase.from("leads").insert({
        session_id: sessionId,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
      });
      onComplete();
    } catch {
      onComplete(); // don't block the game if insert fails
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 max-w-sm mx-auto"
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
        <Input
          type="tel"
          placeholder="Mobile number"
          value={form.mobile}
          onChange={(e) => update("mobile", e.target.value)}
          maxLength={20}
          className={errors.mobile ? "border-destructive" : ""}
        />
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
  );
};

export default LeadCaptureForm;
