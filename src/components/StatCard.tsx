import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  colorClass?: string;
  bgStyle?: string;
  borderStyle?: string;
}

export default function StatCard({ label, value, icon: Icon, colorClass = "text-foreground", bgStyle, borderStyle }: StatCardProps) {
  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        backgroundColor: bgStyle || "var(--muted)",
        borderColor: borderStyle || "var(--border)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className={cn("w-4 h-4", colorClass)} />}
      </div>
      <p className={cn("text-xl font-display font-bold", colorClass)}>{value}</p>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
