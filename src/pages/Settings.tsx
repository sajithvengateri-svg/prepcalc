import { useTheme, THEMES } from "@/contexts/ThemeProvider";
import { Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { themeId, setTheme } = useTheme();

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

        {/* Footer */}
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
