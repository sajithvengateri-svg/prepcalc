import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
  HelpCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { calculateReverseCost, calculateSellPriceFromCost, calculateFoodCostPercent } from "@/lib/calculations/foodCost";
import { FOOD_COST_QUICK_TARGETS, DEFAULT_GST_PERCENT, DEFAULT_TARGET_PERCENT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

type CalculationMode = "reverse" | "forward" | "target";

const modes = [
  { id: "reverse" as const, label: "Max Cost", icon: Target, description: "Set price & target % \u2192 Get max cost" },
  { id: "forward" as const, label: "Set Price", icon: DollarSign, description: "Set cost & target % \u2192 Get sell price" },
  { id: "target" as const, label: "Check %", icon: Percent, description: "Set cost & price \u2192 Get actual %" },
];

export default function CalculatorPage() {
  const [mode, setMode] = useState<CalculationMode>("reverse");
  const [sellPrice, setSellPrice] = useState<number | undefined>(undefined);
  const [targetPercent, setTargetPercent] = useState<number | undefined>(undefined);
  const [actualCost, setActualCost] = useState<number | undefined>(undefined);
  const [showHelp, setShowHelp] = useState(false);
  const [servings, setServings] = useState(1);
  const [gstPercent, setGstPercent] = useState(DEFAULT_GST_PERCENT);
  const [includeGst, setIncludeGst] = useState(true);

  const clearCalculator = () => {
    setSellPrice(undefined);
    setTargetPercent(undefined);
    setActualCost(undefined);
    setServings(1);
  };

  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: () => {
      clearCalculator();
      return new Promise((r) => setTimeout(r, 300));
    },
  });

  // GST-adjusted sell price
  const effectiveSellPrice = sellPrice ? (includeGst ? sellPrice / (1 + gstPercent / 100) : sellPrice) : 0;

  // Calculations
  const tp = targetPercent || DEFAULT_TARGET_PERCENT;
  const reverseResult = calculateReverseCost(effectiveSellPrice, tp, servings);
  const forwardSellPriceExGst = calculateSellPriceFromCost(actualCost || 0, tp);
  const forwardSellPrice = includeGst ? forwardSellPriceExGst * (1 + gstPercent / 100) : forwardSellPriceExGst;
  const actualFoodCostPercent = effectiveSellPrice > 0 ? calculateFoodCostPercent(actualCost || 0, effectiveSellPrice) : 0;

  const roundedActualCost = Math.round((actualCost || 0) * 100) / 100;
  const roundedMaxCost = Math.round(reverseResult.maxAllowedCost * 100) / 100;
  const isOverBudget = roundedActualCost > roundedMaxCost && (actualCost || 0) > 0;
  const costVariance = roundedActualCost - roundedMaxCost;

  const hasReverseResult = sellPrice !== undefined && sellPrice > 0;
  const hasForwardResult = actualCost !== undefined && actualCost > 0;
  const hasTargetResult = hasReverseResult && hasForwardResult;

  return (
    <div className="min-h-[100dvh] flex flex-col relative pb-[86px]" style={{ backgroundColor: "var(--background)" }}>
      {/* Pull to Refresh */}
      <div
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-20"
        style={{
          top: pullDistance > 0 ? pullDistance - 40 : -40,
          opacity: progress,
          transition: pullDistance === 0 ? "all 0.3s ease-out" : "none",
        }}
      >
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-medium",
          isRefreshing && "animate-pulse"
        )} style={{ backgroundColor: "var(--accent)", color: "var(--primary-foreground)" }}>
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Clearing..." : progress >= 1 ? "Release to clear" : "Pull to clear"}
        </div>
      </div>

      {/* Header */}
      <header className="border-b sticky top-0 z-10" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-bg)" }}>
              <Calculator className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold" style={{ color: "var(--foreground)" }}>ChefCalc Pro</h1>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Smart pricing for chefs</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Help</span>
          </button>
        </div>
      </header>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-elevated max-w-md w-full max-h-[85vh] overflow-y-auto"
              style={{ borderRadius: "1.25rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: "var(--accent-bg)" }}>
                    <HelpCircle className="w-5 h-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <h2 className="font-display text-lg font-semibold">How to Use</h2>
                </div>
                <button onClick={() => setShowHelp(false)} className="p-2 rounded-lg hover:opacity-70 transition-opacity">
                  <X className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
              <div className="p-5 space-y-6">
                <HelpItem icon={Target} title="Max Cost Mode"
                  desc='Enter your sell price and target food cost % to find out the maximum you can spend on ingredients per serving.'
                  example="$28 sell price at 30% = $8.40 max ingredient cost"
                />
                <HelpItem icon={DollarSign} title="Set Price Mode"
                  desc='Enter your ingredient cost and target food cost % to calculate what you should charge.'
                  example="$8.50 cost at 30% target = $28.33 sell price"
                />
                <HelpItem icon={Percent} title="Check % Mode"
                  desc='Enter both ingredient cost and sell price to see your actual food cost percentage and margin.'
                  example="$8.50 cost / $28 price = 30.4% food cost"
                />
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--accent-bg)", border: `1px solid color-mix(in srgb, var(--accent) 20%, transparent)` }}>
                  <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>Pro Tip</p>
                  <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Most restaurants target 28-32% food cost. Fine dining may go lower (22-25%), while fast-casual can be higher (32-35%).
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-5">
        {/* Mode Selector */}
        <div className="card-elevated p-4">
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => setMode(m.id)}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-center"
                style={{
                  backgroundColor: mode === m.id ? "var(--accent)" : "var(--muted)",
                  color: mode === m.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  boxShadow: mode === m.id ? `0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent)` : "none",
                }}
              >
                <m.icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{m.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-sm text-center mt-3 flex items-center justify-center gap-2" style={{ color: "var(--muted-foreground)" }}>
            <Calculator className="w-4 h-4" />
            {modes.find((m) => m.id === mode)?.description}
          </p>
        </div>

        {/* GST Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Include GST/Tax</label>
            <button
              onClick={() => setIncludeGst(!includeGst)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ backgroundColor: includeGst ? "var(--accent)" : "var(--border)" }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: includeGst ? "translateX(24px)" : "translateX(4px)" }}
              />
            </button>
          </div>
          {includeGst && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={gstPercent}
                onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm font-medium text-center rounded-lg"
                style={{ backgroundColor: "var(--input-bg)", border: `1px solid var(--border)`, color: "var(--foreground)" }}
                min="0" max="50" step="0.5"
              />
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>%</span>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="card-elevated p-5 space-y-5">
          <AnimatePresence mode="wait">
            {(mode === "reverse" || mode === "target") && (
              <motion.div key="sellPrice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                  Sell Price (per serving)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="number" value={sellPrice ?? ""} placeholder="0.00"
                    onChange={(e) => setSellPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="input-field pl-12 text-xl font-semibold" step="0.01"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(mode === "reverse" || mode === "forward") && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Target Food Cost %
              </label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                <input
                  type="number" value={targetPercent ?? ""} placeholder="30"
                  onChange={(e) => setTargetPercent(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="input-field pl-12 text-xl font-semibold" min="1" max="100" step="0.5"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {FOOD_COST_QUICK_TARGETS.map((pct) => (
                  <motion.button
                    key={pct}
                    onClick={() => setTargetPercent(pct)}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: targetPercent === pct ? "var(--accent)" : "var(--muted)",
                      color: targetPercent === pct ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      boxShadow: targetPercent === pct ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {pct}%
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {(mode === "forward" || mode === "target") && (
              <motion.div key="actualCost" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                  Actual Ingredient Cost
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                  <input
                    type="number" value={actualCost ?? ""} placeholder="0.00"
                    onChange={(e) => setActualCost(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="input-field pl-12 text-xl font-semibold" step="0.01"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "reverse" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Servings per Recipe
              </label>
              <input
                type="number" value={servings} min="1"
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                className="input-field text-xl font-semibold"
              />
            </motion.div>
          )}
        </div>

        {/* Results */}
        <motion.div className="card-elevated overflow-hidden" layout>
          <div className="p-4 border-b" style={{ backgroundColor: "var(--muted)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--foreground)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <span>Calculated Results</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <AnimatePresence mode="wait">
              {/* Reverse Results */}
              {mode === "reverse" && hasReverseResult && (
                <motion.div key="reverse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <ResultHero label="Maximum Allowed Cost" value={`$${reverseResult.maxAllowedCost.toFixed(2)}`}
                    sub={`per serving to hit ${tp}% food cost`} icon={Target} color="var(--accent)" />
                  {servings > 1 && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--warning-bg)", border: `1px solid color-mix(in srgb, var(--warning) 20%, transparent)` }}>
                      <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Total Recipe Budget</p>
                      <p className="text-2xl font-display font-bold" style={{ color: "var(--warning)" }}>${reverseResult.maxIngredientBudget.toFixed(2)}</p>
                      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>for {servings} servings</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <ResultCell label="Target Margin" value={`$${reverseResult.targetMargin.toFixed(2)}`} color="var(--success)" />
                    <ResultCell label="Margin %" value={`${reverseResult.targetMarginPercent.toFixed(1)}%`} color="var(--success)" />
                  </div>
                </motion.div>
              )}

              {/* Forward Results */}
              {mode === "forward" && hasForwardResult && (
                <motion.div key="forward" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <ResultHero
                    label={`Recommended Sell Price${includeGst ? ` (inc. ${gstPercent}% GST)` : ""}`}
                    value={`$${forwardSellPrice.toFixed(2)}`}
                    sub={`to achieve ${tp}% food cost${includeGst ? ` ($${forwardSellPriceExGst.toFixed(2)} ex. GST)` : ""}`}
                    icon={DollarSign} color="var(--accent)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ResultCell label={`Your Margin${includeGst ? " (ex. GST)" : ""}`} value={`$${(forwardSellPriceExGst - (actualCost || 0)).toFixed(2)}`} color="var(--success)" />
                    <ResultCell label="Margin %" value={`${(100 - tp).toFixed(1)}%`} color="var(--success)" />
                  </div>
                </motion.div>
              )}

              {/* Target Results */}
              {mode === "target" && hasTargetResult && (
                <motion.div key="target" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <ResultHero
                    label="Actual Food Cost %"
                    value={`${actualFoodCostPercent.toFixed(1)}%`}
                    sub={isOverBudget ? "Over budget! Consider adjustments." : "Within target range"}
                    icon={Percent}
                    color={isOverBudget ? "var(--destructive)" : "var(--success)"}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ResultCell label={`Actual Margin${includeGst ? " (ex. GST)" : ""}`} value={`$${(effectiveSellPrice - (actualCost || 0)).toFixed(2)}`} color="var(--foreground)" />
                    <ResultCell label="Margin %" value={`${(100 - actualFoodCostPercent).toFixed(1)}%`} color="var(--foreground)" />
                  </div>
                  {isOverBudget && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl" style={{ backgroundColor: "var(--destructive-bg)", border: `1px solid color-mix(in srgb, var(--destructive) 20%, transparent)` }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--destructive)" }}>
                        Cost is ${Math.abs(costVariance).toFixed(2)} over target
                      </p>
                      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Reduce ingredients or increase sell price to ${calculateSellPriceFromCost(actualCost || 0, tp).toFixed(2)}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Empty State */}
              {((mode === "reverse" && !hasReverseResult) ||
                (mode === "forward" && !hasForwardResult) ||
                (mode === "target" && !hasTargetResult)) && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "var(--muted-foreground)" }} />
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Enter values above to see results</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function ResultHero({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }) {
  return (
    <div className="p-5 rounded-2xl" style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`, border: `2px solid color-mix(in srgb, ${color} 25%, transparent)` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-4xl font-display font-bold" style={{ color }}>{value}</p>
      <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
    </div>
  );
}

function ResultCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 15%, transparent)` }}>
      <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <p className="text-xl font-display font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function HelpItem({ icon: Icon, title, desc, example }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; desc: string; example: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
        <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{title}</h3>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
      <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
        Example: {example}
      </div>
    </div>
  );
}
