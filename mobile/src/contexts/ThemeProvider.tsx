import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeId = "light" | "dark" | "pink-onion" | "terminal";

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  destructive: string;
  destructiveBg: string;
  border: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
}

const LIGHT: ThemeColors = {
  background: "#FFFFFF", surface: "#F9FAFB", card: "#FFFFFF", cardBorder: "#F3F4F6",
  text: "#111827", textSecondary: "#6B7280", textMuted: "#9CA3AF",
  accent: "#6366F1", accentBg: "#EEF2FF",
  success: "#10B981", successBg: "#ECFDF5",
  warning: "#F59E0B", warningBg: "#FFFBEB",
  destructive: "#DC2626", destructiveBg: "#FEF2F2",
  border: "#F3F4F6", inputBg: "#F9FAFB",
  tabBar: "#FFFFFF", tabBarBorder: "#E5E7EB",
};

const DARK: ThemeColors = {
  background: "#111827", surface: "#1F2937", card: "#1F2937", cardBorder: "#374151",
  text: "#F9FAFB", textSecondary: "#9CA3AF", textMuted: "#9CA3AF",
  accent: "#818CF8", accentBg: "#312E81",
  success: "#34D399", successBg: "#064E3B",
  warning: "#FBBF24", warningBg: "#78350F",
  destructive: "#F87171", destructiveBg: "#7F1D1D",
  border: "#374151", inputBg: "#1F2937",
  tabBar: "#0F172A", tabBarBorder: "#1E293B",
};

const PINK_ONION: ThemeColors = {
  background: "#FAF5F6", surface: "#FDF9FA", card: "#FEFCFD", cardBorder: "#F2D9DE",
  text: "#2E1318", textSecondary: "#7A5A61", textMuted: "#9E7E85",
  accent: "#D44D72", accentBg: "#FCE8EE",
  success: "#10B981", successBg: "#ECFDF5",
  warning: "#CC7733", warningBg: "#FFF4EB",
  destructive: "#DC2626", destructiveBg: "#FEF2F2",
  border: "#F0D4DA", inputBg: "#FDF9FA",
  tabBar: "#FAF5F6", tabBarBorder: "#F0D4DA",
};

const TERMINAL: ThemeColors = {
  background: "#0A120A", surface: "#111E11", card: "#131F13", cardBorder: "#1E3B1E",
  text: "#66FF66", textSecondary: "#44CC44", textMuted: "#55AA55",
  accent: "#33FF33", accentBg: "#0D2A0D",
  success: "#33FF33", successBg: "#0D2A0D",
  warning: "#CCCC33", warningBg: "#1A1A00",
  destructive: "#DD4444", destructiveBg: "#2A0D0D",
  border: "#1E3B1E", inputBg: "#111E11",
  tabBar: "#060E06", tabBarBorder: "#1A331A",
};

const THEME_MAP: Record<ThemeId, ThemeColors> = {
  light: LIGHT, dark: DARK, "pink-onion": PINK_ONION, terminal: TERMINAL,
};

export interface ThemeMeta {
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
const STORAGE_KEY = "chefcalc-theme";

interface ThemeContextValue {
  themeId: ThemeId;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: "light",
  colors: LIGHT,
  isDark: false,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("light");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && Object.keys(THEME_MAP).includes(stored)) {
        setThemeId(stored as ThemeId);
      }
    });
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    AsyncStorage.setItem(STORAGE_KEY, id);
  };

  const colors = THEME_MAP[themeId];
  const isDark = DARK_THEMES.includes(themeId);

  return (
    <ThemeContext.Provider value={{ themeId, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
