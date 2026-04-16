import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ACCESS_CODE = "watchwhat2026";
const STORAGE_KEY = "watchwhat_access_granted";

export const isAccessGranted = () => {
  return localStorage.getItem(STORAGE_KEY) === "true";
};

export const clearAccess = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const AccessGate = ({ onGranted }: { onGranted: () => void }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toLowerCase() === ACCESS_CODE) {
      localStorage.setItem(STORAGE_KEY, "true");
      onGranted();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Access Required</h1>
          <p className="text-muted-foreground mt-2">Enter the access code to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={error ? "border-red-500 shake" : ""}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500">Incorrect code. Please try again.</p>
          )}
          <Button type="submit" className="w-full">
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AccessGate;
