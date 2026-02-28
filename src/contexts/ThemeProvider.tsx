import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeId = "light" | "dark" | "pink-onion" | "terminal";

interface ThemeMeta {
  id: ThemeId;
  label: string;
  desc: string;
  swatches: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  { id: "light", label: "Kitchen", desc: "Clean & warm", swatches: ["#FFFFFF", "#6366F1", "#10B981"] },
  { id: "dark", label: "Dark", desc: "Easy on the eyes", swatches: ["#111827", "#818CF8", "#34D399"] },
  { id: "pink-onion", label: "Pink Onion", desc: "Warm & rosy", swatches: ["#FAF5F6", "#D44D72", "#10B981"] },
  { id: "terminal", label: "Terminal", desc: "Hacker green-on-black", swatches: ["#0A120A", "#33FF33", "#337733"] },
];

const DARK_THEMES: ThemeId[] = ["dark", "terminal"];

interface ThemeContextValue {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: "light",
  setTheme: () => {},
  isDark: false,
});

const STORAGE_KEY = "chefcalc-theme";

function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.some((t) => t.id === stored)) return stored as ThemeId;
  } catch {
    // ignore
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(getStoredTheme);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "pink-onion", "terminal");
    // Apply theme class (light is default/no class)
    if (themeId !== "light") {
      root.classList.add(themeId);
    }
    // Update meta theme-color for mobile browsers
    const meta = document.querySelector('meta[name="theme-color"]');
    const bgColors: Record<ThemeId, string> = {
      light: "#FFFFFF",
      dark: "#111827",
      "pink-onion": "#FAF5F6",
      terminal: "#0A120A",
    };
    if (meta) meta.setAttribute("content", bgColors[themeId]);
  }, [themeId]);

  const isDark = DARK_THEMES.includes(themeId);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
