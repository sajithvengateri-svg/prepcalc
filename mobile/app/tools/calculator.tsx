import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  StyleSheet,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Target,
  DollarSign,
  Percent,
  TrendingUp,
  Calculator,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../src/contexts/ThemeProvider";

// ─── Food cost calculation utilities (ported from src/lib/calculations/foodCost.ts) ───
const calculateReverseCost = (
  sellPrice: number,
  targetPercent: number,
  servings: number = 1
) => {
  const maxAllowedCost = (sellPrice * targetPercent) / 100;
  const maxIngredientBudget = maxAllowedCost * servings;
  const targetMargin = sellPrice - maxAllowedCost;
  const targetMarginPercent = 100 - targetPercent;
  return { maxAllowedCost, maxIngredientBudget, targetMargin, targetMarginPercent };
};

const calculateSellPriceFromCost = (actualCost: number, targetPercent: number) => {
  if (targetPercent === 0) return 0;
  return actualCost / (targetPercent / 100);
};

const calculateFoodCostPercent = (actualCost: number, sellPrice: number) => {
  if (sellPrice === 0) return 0;
  return (actualCost / sellPrice) * 100;
};

// ─── Constants (from src/lib/constants.ts) ───
const FOOD_COST_QUICK_TARGETS = [22, 25, 28, 30, 32, 35];
const DEFAULT_GST_PERCENT = 10;
const DEFAULT_TARGET_PERCENT = 30;

type CalcMode = "reverse" | "forward" | "target";

const MODES: { id: CalcMode; label: string; desc: string; Icon: React.ElementType }[] = [
  { id: "reverse", label: "Max Cost", desc: "Set price & target % → Get max cost", Icon: Target },
  { id: "forward", label: "Set Price", desc: "Set cost & target % → Get sell price", Icon: DollarSign },
  { id: "target", label: "Check %", desc: "Set cost & price → Get actual %", Icon: Percent },
];

export default function CalculatorScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<CalcMode>("reverse");
  const [sellPrice, setSellPrice] = useState("");
  const [targetPercent, setTargetPercent] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [servings, setServings] = useState("1");
  const [gstPercent, setGstPercent] = useState(DEFAULT_GST_PERCENT);
  const [includeGst, setIncludeGst] = useState(true);

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const clearAll = () => {
    tap();
    setSellPrice("");
    setTargetPercent("");
    setActualCost("");
    setServings("1");
  };

  // Parsed values
  const sp = parseFloat(sellPrice) || 0;
  const tp = parseFloat(targetPercent) || DEFAULT_TARGET_PERCENT;
  const ac = parseFloat(actualCost) || 0;
  const sv = parseInt(servings) || 1;

  // GST-adjusted sell price
  const effectiveSellPrice = sp > 0 ? (includeGst ? sp / (1 + gstPercent / 100) : sp) : 0;

  // Calculations
  const reverseResult = calculateReverseCost(effectiveSellPrice, tp, sv);
  const forwardSellPriceExGst = calculateSellPriceFromCost(ac, tp);
  const forwardSellPrice = includeGst
    ? forwardSellPriceExGst * (1 + gstPercent / 100)
    : forwardSellPriceExGst;
  const actualFoodCostPct = effectiveSellPrice > 0
    ? calculateFoodCostPercent(ac, effectiveSellPrice)
    : 0;

  const roundedActualCost = Math.round(ac * 100) / 100;
  const roundedMaxCost = Math.round(reverseResult.maxAllowedCost * 100) / 100;
  const isOverBudget = roundedActualCost > roundedMaxCost && ac > 0;
  const costVariance = roundedActualCost - roundedMaxCost;

  const hasReverseResult = sp > 0;
  const hasForwardResult = ac > 0;
  const hasTargetResult = hasReverseResult && hasForwardResult;

  return (
    <SafeAreaView style={[st.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[st.title, { color: colors.text }]}>ChefCalc Pro</Text>
          <Text style={[st.subtitle, { color: colors.textMuted }]}>
            Smart pricing for chefs
          </Text>
        </View>
        <TouchableOpacity onPress={clearAll} style={[st.clearBtn, { backgroundColor: colors.surface }]}>
          <Text style={[st.clearText, { color: colors.textMuted }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mode Selector */}
        <View style={[st.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={st.modeRow}>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => { tap(); setMode(m.id); }}
                style={[
                  st.modePill,
                  {
                    backgroundColor: mode === m.id ? colors.accent : colors.surface,
                  },
                ]}
              >
                <m.Icon
                  size={18}
                  color={mode === m.id ? "#FFFFFF" : colors.textMuted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    st.modePillText,
                    { color: mode === m.id ? "#FFFFFF" : colors.textMuted },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={st.modeDescRow}>
            <Calculator size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={[st.modeDesc, { color: colors.textMuted }]}>
              {MODES.find((m) => m.id === mode)?.desc}
            </Text>
          </View>
        </View>

        {/* GST Toggle */}
        <View style={[st.gstBar, { backgroundColor: colors.surface }]}>
          <View style={st.gstLeft}>
            <Text style={[st.gstLabel, { color: colors.text }]}>Include GST/Tax</Text>
            <Switch
              value={includeGst}
              onValueChange={setIncludeGst}
              trackColor={{ false: colors.border, true: colors.accent + "60" }}
              thumbColor={includeGst ? colors.accent : "#F4F4F5"}
            />
          </View>
          {includeGst && (
            <View style={st.gstRateWrap}>
              <TextInput
                value={String(gstPercent)}
                onChangeText={(v) => setGstPercent(parseFloat(v) || 0)}
                keyboardType="decimal-pad"
                style={[
                  st.gstRateInput,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
              />
              <Text style={[st.gstRateSign, { color: colors.textMuted }]}>%</Text>
            </View>
          )}
        </View>

        {/* Inputs Card */}
        <View style={[st.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Sell Price (reverse + target modes) */}
          {(mode === "reverse" || mode === "target") && (
            <View style={st.inputGroup}>
              <Text style={[st.inputLabel, { color: colors.text }]}>
                Sell Price (per serving)
              </Text>
              <View style={st.inputWrap}>
                <DollarSign size={18} color={colors.textMuted} strokeWidth={2} />
                <TextInput
                  value={sellPrice}
                  onChangeText={setSellPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={[st.input, { color: colors.text }]}
                />
              </View>
            </View>
          )}

          {/* Target % (reverse + forward modes) */}
          {(mode === "reverse" || mode === "forward") && (
            <View style={st.inputGroup}>
              <Text style={[st.inputLabel, { color: colors.text }]}>
                Target Food Cost %
              </Text>
              <View style={st.inputWrap}>
                <Percent size={18} color={colors.textMuted} strokeWidth={2} />
                <TextInput
                  value={targetPercent}
                  onChangeText={setTargetPercent}
                  placeholder="30"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={[st.input, { color: colors.text }]}
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, marginTop: 8 }}
              >
                {FOOD_COST_QUICK_TARGETS.map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    onPress={() => { tap(); setTargetPercent(String(pct)); }}
                    style={[
                      st.quickPill,
                      {
                        backgroundColor:
                          targetPercent === String(pct) ? colors.accent : colors.surface,
                        borderColor:
                          targetPercent === String(pct) ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        st.quickPillText,
                        {
                          color: targetPercent === String(pct) ? "#FFFFFF" : colors.textMuted,
                        },
                      ]}
                    >
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Actual Cost (forward + target modes) */}
          {(mode === "forward" || mode === "target") && (
            <View style={st.inputGroup}>
              <Text style={[st.inputLabel, { color: colors.text }]}>
                Actual Ingredient Cost
              </Text>
              <View style={st.inputWrap}>
                <DollarSign size={18} color={colors.textMuted} strokeWidth={2} />
                <TextInput
                  value={actualCost}
                  onChangeText={setActualCost}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  style={[st.input, { color: colors.text }]}
                />
              </View>
            </View>
          )}

          {/* Servings (reverse mode only) */}
          {mode === "reverse" && (
            <View style={st.inputGroup}>
              <Text style={[st.inputLabel, { color: colors.text }]}>
                Servings per Recipe
              </Text>
              <TextInput
                value={servings}
                onChangeText={setServings}
                keyboardType="number-pad"
                style={[
                  st.servingsInput,
                  { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              />
            </View>
          )}
        </View>

        {/* Results */}
        <View style={[st.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[st.resultsHeader, { borderBottomColor: colors.border }]}>
            <TrendingUp size={16} color={colors.accent} strokeWidth={2} />
            <Text style={[st.resultsTitle, { color: colors.text }]}>
              Calculated Results
            </Text>
          </View>

          {/* Reverse Results */}
          {mode === "reverse" && hasReverseResult && (
            <View style={st.resultsBody}>
              <View style={[st.heroBox, { backgroundColor: colors.accentBg, borderColor: colors.accent + "40" }]}>
                <Text style={[st.heroLabel, { color: colors.textMuted }]}>
                  Maximum Allowed Cost
                </Text>
                <Text style={[st.heroValue, { color: colors.accent }]}>
                  ${reverseResult.maxAllowedCost.toFixed(2)}
                </Text>
                <Text style={[st.heroSub, { color: colors.textMuted }]}>
                  per serving to hit {tp}% food cost
                </Text>
              </View>

              {sv > 1 && (
                <View style={[st.budgetBox, { backgroundColor: "#FEF3C7", borderColor: "#D97706" + "30" }]}>
                  <Text style={[st.budgetLabel, { color: colors.textMuted }]}>
                    Total Recipe Budget
                  </Text>
                  <Text style={[st.budgetValue, { color: "#D97706" }]}>
                    ${reverseResult.maxIngredientBudget.toFixed(2)}
                  </Text>
                  <Text style={[st.budgetSub, { color: colors.textMuted }]}>
                    for {sv} servings
                  </Text>
                </View>
              )}

              <View style={st.resultGrid}>
                <ResultCell label="Target Margin" value={`$${reverseResult.targetMargin.toFixed(2)}`} color="#16A34A" bgColor="#DCFCE7" />
                <ResultCell label="Margin %" value={`${reverseResult.targetMarginPercent.toFixed(1)}%`} color="#16A34A" bgColor="#DCFCE7" />
              </View>
            </View>
          )}

          {/* Forward Results */}
          {mode === "forward" && hasForwardResult && (
            <View style={st.resultsBody}>
              <View style={[st.heroBox, { backgroundColor: colors.accentBg, borderColor: colors.accent + "40" }]}>
                <Text style={[st.heroLabel, { color: colors.textMuted }]}>
                  Recommended Sell Price{includeGst ? ` (inc. ${gstPercent}% GST)` : ""}
                </Text>
                <Text style={[st.heroValue, { color: colors.accent }]}>
                  ${forwardSellPrice.toFixed(2)}
                </Text>
                <Text style={[st.heroSub, { color: colors.textMuted }]}>
                  to achieve {tp}% food cost
                  {includeGst ? ` ($${forwardSellPriceExGst.toFixed(2)} ex. GST)` : ""}
                </Text>
              </View>
              <View style={st.resultGrid}>
                <ResultCell
                  label={`Margin${includeGst ? " (ex. GST)" : ""}`}
                  value={`$${(forwardSellPriceExGst - ac).toFixed(2)}`}
                  color="#16A34A" bgColor="#DCFCE7"
                />
                <ResultCell label="Margin %" value={`${(100 - tp).toFixed(1)}%`} color="#16A34A" bgColor="#DCFCE7" />
              </View>
            </View>
          )}

          {/* Target Results */}
          {mode === "target" && hasTargetResult && (
            <View style={st.resultsBody}>
              <View
                style={[
                  st.heroBox,
                  {
                    backgroundColor: isOverBudget ? "#FEE2E2" : "#DCFCE7",
                    borderColor: isOverBudget ? "#DC2626" + "40" : "#16A34A" + "40",
                  },
                ]}
              >
                <Text style={[st.heroLabel, { color: colors.textMuted }]}>
                  Actual Food Cost %
                </Text>
                <Text
                  style={[
                    st.heroValue,
                    { color: isOverBudget ? "#DC2626" : "#16A34A" },
                  ]}
                >
                  {actualFoodCostPct.toFixed(1)}%
                </Text>
                <Text style={[st.heroSub, { color: colors.textMuted }]}>
                  {isOverBudget ? "Over budget! Consider adjustments." : "Within target range"}
                </Text>
              </View>

              <View style={st.resultGrid}>
                <ResultCell
                  label={`Margin${includeGst ? " (ex. GST)" : ""}`}
                  value={`$${(effectiveSellPrice - ac).toFixed(2)}`}
                  color={colors.text} bgColor={colors.surface}
                />
                <ResultCell
                  label="Margin %"
                  value={`${(100 - actualFoodCostPct).toFixed(1)}%`}
                  color={colors.text} bgColor={colors.surface}
                />
              </View>

              {isOverBudget && (
                <View style={[st.warningBox, { backgroundColor: "#FEE2E2", borderColor: "#DC2626" + "30" }]}>
                  <Text style={[st.warningText, { color: "#DC2626" }]}>
                    Cost is ${Math.abs(costVariance).toFixed(2)} over target
                  </Text>
                  <Text style={[st.warningSub, { color: colors.textMuted }]}>
                    Reduce ingredients or increase sell price to $
                    {calculateSellPriceFromCost(ac, tp).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Empty state */}
          {((mode === "reverse" && !hasReverseResult) ||
            (mode === "forward" && !hasForwardResult) ||
            (mode === "target" && !hasTargetResult)) && (
            <View style={st.emptyState}>
              <Calculator size={40} color={colors.textMuted} strokeWidth={1.5} style={{ opacity: 0.3 }} />
              <Text style={[st.emptyText, { color: colors.textMuted }]}>
                Enter values above to see results
              </Text>
            </View>
          )}
        </View>

        {/* Pro tip */}
        <View style={[st.tipBox, { backgroundColor: colors.accentBg, borderColor: colors.accent + "30" }]}>
          <Text style={[st.tipLabel, { color: colors.accent }]}>Pro Tip</Text>
          <Text style={[st.tipText, { color: colors.textMuted }]}>
            Most restaurants target 28-32% food cost. Fine dining may go lower
            (22-25%), while fast-casual can be higher (32-35%).
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Result Cell Component ───
function ResultCell({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[st.resultCell, { backgroundColor: bgColor }]}>
      <Text style={[st.resultCellLabel, { color: "#6B7280" }]}>{label}</Text>
      <Text style={[st.resultCellValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───
const st = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 1 },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  clearText: { fontSize: 13, fontWeight: "600" },
  scroll: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  // Mode selector
  modeRow: { flexDirection: "row", gap: 6 },
  modePill: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modePillText: { fontSize: 12, fontWeight: "600" },
  modeDescRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  modeDesc: { fontSize: 12 },
  // GST
  gstBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12 },
  gstLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  gstLabel: { fontSize: 14, fontWeight: "600" },
  gstRateWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  gstRateInput: {
    width: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  gstRateSign: { fontSize: 14, fontWeight: "500" },
  // Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  input: { flex: 1, fontSize: 22, fontWeight: "600", fontVariant: ["tabular-nums"], padding: 0 },
  servingsInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  quickPill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  quickPillText: { fontSize: 13, fontWeight: "600" },
  // Results
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  resultsTitle: { fontSize: 14, fontWeight: "600" },
  resultsBody: { gap: 12 },
  heroBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  heroLabel: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  heroValue: { fontSize: 36, fontWeight: "800", fontVariant: ["tabular-nums"] },
  heroSub: { fontSize: 13, marginTop: 4 },
  budgetBox: { padding: 14, borderRadius: 12, borderWidth: 1 },
  budgetLabel: { fontSize: 12, fontWeight: "500" },
  budgetValue: { fontSize: 26, fontWeight: "800", fontVariant: ["tabular-nums"] },
  budgetSub: { fontSize: 12, marginTop: 2 },
  resultGrid: { flexDirection: "row", gap: 8 },
  resultCell: { flex: 1, padding: 12, borderRadius: 12 },
  resultCellLabel: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
  resultCellValue: { fontSize: 20, fontWeight: "700", fontVariant: ["tabular-nums"] },
  warningBox: { padding: 14, borderRadius: 12, borderWidth: 1 },
  warningText: { fontSize: 14, fontWeight: "600" },
  warningSub: { fontSize: 13, marginTop: 4 },
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 12 },
  emptyText: { fontSize: 13 },
  tipBox: { padding: 14, borderRadius: 12, borderWidth: 1 },
  tipLabel: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 20 },
});
