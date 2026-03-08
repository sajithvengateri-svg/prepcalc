import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeId = "default" | "auto" | "dark" | "pink-onion" | "terminal";

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

const DEFAULT_THEME: ThemeColors = {
  background: "#FAFAF8",
  surface: "#F5F5F3",
  card: "#FFFFFF",
  cardBorder: "#E8E8E4",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  accent: "#16A34A",
  accentBg: "#DCFCE7",
  success: "#16A34A",
  successBg: "#DCFCE7",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  destructive: "#DC2626",
  destructiveBg: "#FEF2F2",
  border: "#E8E8E4",
  inputBg: "#FAFAF8",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E8E8E4",
};

const DARK_THEME: ThemeColors = {
  background: "#0F0F0F",
  surface: "#1A1A1A",
  card: "#1E1E1E",
  cardBorder: "#2E2E2E",
  text: "#F5F5F5",
  textSecondary: "#A0A0A0",
  textMuted: "#707070",
  accent: "#22C55E",
  accentBg: "#052E16",
  success: "#22C55E",
  successBg: "#052E16",
  warning: "#F59E0B",
  warningBg: "#451A03",
  destructive: "#EF4444",
  destructiveBg: "#450A0A",
  border: "#2E2E2E",
  inputBg: "#1A1A1A",
  tabBar: "#0F0F0F",
  tabBarBorder: "#2E2E2E",
};

const PINK_ONION: ThemeColors = {
  background: "#FDF2F8",
  surface: "#FCE7F3",
  card: "#FFFFFF",
  cardBorder: "#F9A8D4",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  accent: "#DB2777",
  accentBg: "#FCE7F3",
  success: "#16A34A",
  successBg: "#DCFCE7",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  destructive: "#DC2626",
  destructiveBg: "#FEF2F2",
  border: "#F9A8D4",
  inputBg: "#FDF2F8",
  tabBar: "#FFFFFF",
  tabBarBorder: "#F9A8D4",
};

const TERMINAL: ThemeColors = {
  background: "#0A0A0A",
  surface: "#0D1117",
  card: "#0D1117",
  cardBorder: "#1E3A1E",
  text: "#00FF41",
  textSecondary: "#00CC33",
  textMuted: "#008822",
  accent: "#00FF41",
  accentBg: "#0D1F0D",
  success: "#00FF41",
  successBg: "#0D1F0D",
  warning: "#CCCC00",
  warningBg: "#1A1A00",
  destructive: "#FF4444",
  destructiveBg: "#2A0D0D",
  border: "#1E3A1E",
  inputBg: "#0D1117",
  tabBar: "#0A0A0A",
  tabBarBorder: "#1E3A1E",
};

const THEME_MAP: Record<Exclude<ThemeId, "auto">, ThemeColors> = {
  default: DEFAULT_THEME,
  dark: DARK_THEME,
  "pink-onion": PINK_ONION,
  terminal: TERMINAL,
};

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  desc: string;
  swatches: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  {
    id: "default",
    label: "Default",
    desc: "Clean & warm",
    swatches: ["#FAFAF8", "#16A34A", "#FFFFFF"],
  },
  {
    id: "auto",
    label: "Auto",
    desc: "Follows device",
    swatches: ["#FAFAF8", "#0F0F0F", "#16A34A"],
  },
  {
    id: "dark",
    label: "Dark",
    desc: "Easy on the eyes",
    swatches: ["#0F0F0F", "#22C55E", "#1E1E1E"],
  },
  {
    id: "pink-onion",
    label: "Pink Onion",
    desc: "Warm & rosy",
    swatches: ["#FDF2F8", "#DB2777", "#FFFFFF"],
  },
  {
    id: "terminal",
    label: "Terminal",
    desc: "Hacker vibes",
    swatches: ["#0A0A0A", "#00FF41", "#0D1117"],
  },
];

const DARK_THEMES: string[] = ["dark", "terminal"];
const STORAGE_KEY = "prepcalc-theme";

interface ThemeContextValue {
  themeId: ThemeId;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: "default",
  colors: DEFAULT_THEME,
  isDark: false,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("default");
  const deviceScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && [...Object.keys(THEME_MAP), "auto"].includes(stored)) {
        setThemeId(stored as ThemeId);
      }
    });
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeId(id);
    AsyncStorage.setItem(STORAGE_KEY, id);
  };

  let resolvedId: Exclude<ThemeId, "auto">;
  if (themeId === "auto") {
    resolvedId = deviceScheme === "dark" ? "dark" : "default";
  } else {
    resolvedId = themeId;
  }

  const colors = THEME_MAP[resolvedId];
  const isDark = DARK_THEMES.includes(resolvedId);

  return (
    <ThemeContext.Provider value={{ themeId, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
