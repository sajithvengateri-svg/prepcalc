import { useLocation, useNavigate } from "react-router-dom";
import { Calculator, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", label: "Calculator", icon: Calculator },
  { path: "/settings", label: "Settings", icon: Settings },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around h-[70px]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.25 : 1.5} />
              <span className="text-[11px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
