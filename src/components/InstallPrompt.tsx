import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "chefcalc_install_dismissed_v1";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function getIsStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  return { isIos: /iphone|ipad|ipod/.test(ua), isAndroid: /android/.test(ua) };
}

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [bipEvent, setBipEvent] = useState<BeforeInstallPromptEvent | null>(null);

  const dismissed = useMemo(() => {
    try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  }, []);

  const { isIos, isAndroid } = useMemo(getPlatform, []);

  useEffect(() => {
    if (dismissed || getIsStandalone()) return;
    if (isIos) {
      const t = window.setTimeout(() => setOpen(true), 900);
      return () => window.clearTimeout(t);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setBipEvent(e as BeforeInstallPromptEvent);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed, isIos, isAndroid]);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    setOpen(false);
  };

  const onInstall = async () => {
    if (!bipEvent) return;
    await bipEvent.prompt();
    try { await bipEvent.userChoice; } finally { setBipEvent(null); dismiss(); }
  };

  if (!open || dismissed || getIsStandalone()) return null;
  if (!isIos && !isAndroid) return null;

  return (
    <div className="fixed bottom-[86px] left-4 right-4 z-40 card-elevated p-4 shadow-lg max-w-2xl mx-auto">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground">
            {isIos ? "Install ChefCalc Pro" : "Install this app"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isIos
              ? "Tap Share, then 'Add to Home Screen' for a full-screen app experience."
              : "Install for quick access from your home screen."}
          </p>
          {bipEvent && isAndroid && (
            <button
              onClick={onInstall}
              className="mt-2 px-4 py-1.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "var(--primary-foreground)" }}
            >
              Install
            </button>
          )}
        </div>
        <button onClick={dismiss} className="p-1 rounded-lg hover:opacity-70 transition-opacity">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
