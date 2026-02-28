import { Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { ThemeProvider, useTheme } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";
import CalculatorPage from "@/pages/Calculator";
import SettingsPage from "@/pages/Settings";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    toast.error("Something's burning... we'll fix it!", {
      description: "Try refreshing or come back shortly.",
      duration: 5000,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", padding: 24, backgroundColor: "var(--background)", color: "var(--foreground)", textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 8 }}>&#x1F525;</p>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something's burning...</h2>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 20 }}>We'll fix it! Try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 24px", borderRadius: 12, backgroundColor: "var(--accent)", color: "var(--primary-foreground)", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ThemedToaster() {
  const { isDark } = useTheme();
  return <Toaster theme={isDark ? "dark" : "light"} position="top-center" richColors closeButton />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CalculatorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
            <BottomNav />
            <InstallPrompt />
          </BrowserRouter>
        </ErrorBoundary>
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Export toast for use anywhere
export { toast };
