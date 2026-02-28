import { useState } from "react";
import { useTheme, THEMES } from "@/contexts/ThemeProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { Check, ExternalLink, LogOut, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const { themeId, setTheme } = useTheme();
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async () => {
    setAuthError(null);
    setAuthLoading(true);
    const fn = isSignUp ? signUp : signIn;
    const { error } = await fn(email, password);
    if (error) {
      setAuthError(error);
      toast.error("Something's burning... we'll fix it!", { description: error });
    } else {
      setEmail(""); setPassword("");
      toast.success(isSignUp ? "Account created!" : "Welcome back, chef!");
    }
    setAuthLoading(false);
  };

  return (
    <div className="min-h-[100dvh] pb-[86px]" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-display text-xl font-bold" style={{ color: "var(--foreground)" }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>Customize your experience</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-5 space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
            Account
          </h2>
          <div className="card-elevated p-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
              </div>
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}>
                    {(user.email?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{user.email}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Signed in</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "var(--destructive-bg)", color: "var(--destructive)" }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                    className="input-field pl-10 text-sm"
                  />
                </div>
                <AnimatePresence>
                  {authError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs px-1" style={{ color: "var(--destructive)" }}>
                      {authError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button
                  onClick={handleAuth}
                  disabled={authLoading || !email || !password}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)", color: "var(--primary-foreground)" }}
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--primary-foreground)", borderTopColor: "transparent" }} />
                  ) : isSignUp ? (
                    <><UserPlus className="w-4 h-4" /> Create Account</>
                  ) : (
                    <><LogIn className="w-4 h-4" /> Sign In</>
                  )}
                </button>
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }}
                  className="w-full text-center text-xs py-1 transition-opacity hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Theme Selection */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
            Theme
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={themeId === theme.id}
                onSelect={() => setTheme(theme.id)}
              />
            ))}
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>
            About
          </h2>
          <div className="card-elevated divide-y" style={{ borderColor: "var(--card-border)" }}>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm" style={{ color: "var(--foreground)" }}>Version</span>
              <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm" style={{ color: "var(--foreground)" }}>Built by</span>
              <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>ChefOS Team</span>
            </div>
            <a
              href="https://chefos.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:opacity-70 transition-opacity"
            >
              <span className="text-sm" style={{ color: "var(--foreground)" }}>Website</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>chefos.ai</span>
                <ExternalLink className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              </div>
            </a>
          </div>
        </section>

        <p className="text-center text-xs pt-4" style={{ color: "var(--muted-foreground)" }}>
          Built for chefs & restaurant owners
        </p>
      </main>
    </div>
  );
}

function ThemeCard({ theme, isActive, onSelect }: { theme: typeof THEMES[number]; isActive: boolean; onSelect: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="card-elevated p-4 text-left relative overflow-hidden transition-all"
      style={{
        borderColor: isActive ? "var(--accent)" : "var(--card-border)",
        borderWidth: isActive ? 2 : 1,
      }}
    >
      {isActive && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--accent)" }}>
          <Check className="w-3 h-3" style={{ color: "var(--primary-foreground)" }} />
        </div>
      )}
      <div className="flex gap-1.5 mb-3">
        {theme.swatches.map((color, i) => (
          <div key={i} className="w-6 h-6 rounded-full border" style={{ backgroundColor: color, borderColor: "rgba(0,0,0,0.1)" }} />
        ))}
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{theme.label}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{theme.desc}</p>
    </motion.button>
  );
}
