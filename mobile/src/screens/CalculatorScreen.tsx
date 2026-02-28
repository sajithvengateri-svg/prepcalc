import React, { useState } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Platform, KeyboardAvoidingView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../contexts/ThemeProvider";
import {
  calculateReverseCost, calculateSellPriceFromCost,
  calculateFoodCostPercent, FOOD_COST_QUICK_TARGETS,
} from "../lib/calculations";

type Mode = "reverse" | "forward" | "target";

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: "reverse", label: "Max Cost", desc: "Set price & target % → Get max cost" },
  { id: "forward", label: "Set Price", desc: "Set cost & target % → Get sell price" },
  { id: "target", label: "Check %", desc: "Set cost & price → Get actual %" },
];

export default function CalculatorScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("reverse");
  const [sellPrice, setSellPrice] = useState("");
  const [targetPercent, setTargetPercent] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [servings, setServings] = useState("1");
  const [gstPercent, setGstPercent] = useState("10");
  const [includeGst, setIncludeGst] = useState(true);

  const sp = parseFloat(sellPrice) || 0;
  const tp = parseFloat(targetPercent) || 30;
  const ac = parseFloat(actualCost) || 0;
  const srv = parseInt(servings) || 1;
  const gst = parseFloat(gstPercent) || 0;

  const effectiveSP = sp > 0 ? (includeGst ? sp / (1 + gst / 100) : sp) : 0;
  const reverse = calculateReverseCost(effectiveSP, tp, srv);
  const forwardExGst = calculateSellPriceFromCost(ac, tp);
  const forwardPrice = includeGst ? forwardExGst * (1 + gst / 100) : forwardExGst;
  const actualPct = effectiveSP > 0 ? calculateFoodCostPercent(ac, effectiveSP) : 0;

  const roundedAC = Math.round(ac * 100) / 100;
  const roundedMax = Math.round(reverse.maxAllowedCost * 100) / 100;
  const isOver = roundedAC > roundedMax && ac > 0;
  const variance = roundedAC - roundedMax;

  const hasReverse = sp > 0;
  const hasForward = ac > 0;
  const hasTarget = sp > 0 && ac > 0;

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={[s.container, { backgroundColor: colors.background }]} contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <View style={[s.logoBox, { backgroundColor: colors.accentBg }]}>
            <Text style={[s.logoIcon, { color: colors.accent }]}>C</Text>
          </View>
          <View>
            <Text style={[s.title, { color: colors.text }]}>ChefCalc Pro</Text>
            <Text style={[s.subtitle, { color: colors.textMuted }]}>Smart pricing for chefs</Text>
          </View>
        </View>

        {/* Mode Selector */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={s.modeRow}>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => { tap(); setMode(m.id); }}
                style={[
                  s.modeBtn,
                  {
                    backgroundColor: mode === m.id ? colors.accent : colors.surface,
                  },
                ]}
              >
                <Text style={[s.modeBtnText, { color: mode === m.id ? "#FFFFFF" : colors.textMuted }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.modeDesc, { color: colors.textMuted }]}>
            {MODES.find((m) => m.id === mode)?.desc}
          </Text>
        </View>

        {/* GST Toggle */}
        <View style={[s.gstRow, { backgroundColor: colors.surface }]}>
          <Text style={[s.gstLabel, { color: colors.text }]}>Include GST/Tax</Text>
          <Switch
            value={includeGst}
            onValueChange={(v) => { tap(); setIncludeGst(v); }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
          />
          {includeGst && (
            <View style={s.gstInput}>
              <TextInput
                value={gstPercent}
                onChangeText={setGstPercent}
                keyboardType="decimal-pad"
                style={[s.gstField, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              />
              <Text style={[s.gstPct, { color: colors.textMuted }]}>%</Text>
            </View>
          )}
        </View>

        {/* Inputs */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {(mode === "reverse" || mode === "target") && (
            <View style={s.inputGroup}>
              <Text style={[s.inputLabel, { color: colors.text }]}>Sell Price (per serving)</Text>
              <View style={[s.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={[s.inputPrefix, { color: colors.textMuted }]}>$</Text>
                <TextInput
                  value={sellPrice}
                  onChangeText={setSellPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted + "66"}
                  keyboardType="decimal-pad"
                  style={[s.input, { color: colors.text }]}
                />
              </View>
            </View>
          )}

          {(mode === "reverse" || mode === "forward") && (
            <View style={s.inputGroup}>
              <Text style={[s.inputLabel, { color: colors.text }]}>Target Food Cost %</Text>
              <View style={[s.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={[s.inputPrefix, { color: colors.textMuted }]}>%</Text>
                <TextInput
                  value={targetPercent}
                  onChangeText={setTargetPercent}
                  placeholder="30"
                  placeholderTextColor={colors.textMuted + "66"}
                  keyboardType="decimal-pad"
                  style={[s.input, { color: colors.text }]}
                />
              </View>
              <View style={s.quickRow}>
                {FOOD_COST_QUICK_TARGETS.map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    onPress={() => { tap(); setTargetPercent(String(pct)); }}
                    style={[
                      s.quickBtn,
                      {
                        backgroundColor: targetPercent === String(pct) ? colors.accent : colors.surface,
                      },
                    ]}
                  >
                    <Text style={[s.quickBtnText, { color: targetPercent === String(pct) ? "#FFFFFF" : colors.textMuted }]}>
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(mode === "forward" || mode === "target") && (
            <View style={s.inputGroup}>
              <Text style={[s.inputLabel, { color: colors.text }]}>Actual Ingredient Cost</Text>
              <View style={[s.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Text style={[s.inputPrefix, { color: colors.textMuted }]}>$</Text>
                <TextInput
                  value={actualCost}
                  onChangeText={setActualCost}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted + "66"}
                  keyboardType="decimal-pad"
                  style={[s.input, { color: colors.text }]}
                />
              </View>
            </View>
          )}

          {mode === "reverse" && (
            <View style={s.inputGroup}>
              <Text style={[s.inputLabel, { color: colors.text }]}>Servings per Recipe</Text>
              <View style={[s.inputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="number-pad"
                  style={[s.input, { color: colors.text, paddingLeft: 16 }]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Results */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[s.resultsHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[s.resultsTitle, { color: colors.text }]}>Calculated Results</Text>
          </View>

          <View style={s.resultsBody}>
            {/* Reverse Results */}
            {mode === "reverse" && hasReverse && (
              <>
                <HeroResult label="Maximum Allowed Cost" value={`$${reverse.maxAllowedCost.toFixed(2)}`}
                  sub={`per serving to hit ${tp}% food cost`} color={colors.accent} colors={colors} />
                {srv > 1 && (
                  <View style={[s.resultBox, { backgroundColor: colors.warningBg, borderColor: colors.warning + "33" }]}>
                    <Text style={[s.resultBoxLabel, { color: colors.textMuted }]}>Total Recipe Budget</Text>
                    <Text style={[s.resultBoxValueMd, { color: colors.warning }]}>${reverse.maxIngredientBudget.toFixed(2)}</Text>
                    <Text style={[s.resultBoxSub, { color: colors.textMuted }]}>for {srv} servings</Text>
                  </View>
                )}
                <View style={s.resultGrid}>
                  <ResultCell label="Target Margin" value={`$${reverse.targetMargin.toFixed(2)}`} color={colors.success} colors={colors} />
                  <ResultCell label="Margin %" value={`${reverse.targetMarginPercent.toFixed(1)}%`} color={colors.success} colors={colors} />
                </View>
              </>
            )}

            {/* Forward Results */}
            {mode === "forward" && hasForward && (
              <>
                <HeroResult
                  label={`Recommended Sell Price${includeGst ? ` (inc. ${gst}% GST)` : ""}`}
                  value={`$${forwardPrice.toFixed(2)}`}
                  sub={`to achieve ${tp}% food cost${includeGst ? ` ($${forwardExGst.toFixed(2)} ex. GST)` : ""}`}
                  color={colors.accent} colors={colors}
                />
                <View style={s.resultGrid}>
                  <ResultCell label={`Your Margin${includeGst ? " (ex. GST)" : ""}`} value={`$${(forwardExGst - ac).toFixed(2)}`} color={colors.success} colors={colors} />
                  <ResultCell label="Margin %" value={`${(100 - tp).toFixed(1)}%`} color={colors.success} colors={colors} />
                </View>
              </>
            )}

            {/* Target Results */}
            {mode === "target" && hasTarget && (
              <>
                <HeroResult
                  label="Actual Food Cost %"
                  value={`${actualPct.toFixed(1)}%`}
                  sub={isOver ? "Over budget! Consider adjustments." : "Within target range"}
                  color={isOver ? colors.destructive : colors.success} colors={colors}
                />
                <View style={s.resultGrid}>
                  <ResultCell label="Actual Margin" value={`$${(effectiveSP - ac).toFixed(2)}`} color={colors.text} colors={colors} />
                  <ResultCell label="Margin %" value={`${(100 - actualPct).toFixed(1)}%`} color={colors.text} colors={colors} />
                </View>
                {isOver && (
                  <View style={[s.alertBox, { backgroundColor: colors.destructiveBg, borderColor: colors.destructive + "33" }]}>
                    <Text style={[s.alertTitle, { color: colors.destructive }]}>
                      Cost is ${Math.abs(variance).toFixed(2)} over target
                    </Text>
                    <Text style={[s.alertSub, { color: colors.textMuted }]}>
                      Reduce ingredients or increase sell price to ${calculateSellPriceFromCost(ac, tp).toFixed(2)}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Empty State */}
            {((mode === "reverse" && !hasReverse) ||
              (mode === "forward" && !hasForward) ||
              (mode === "target" && !hasTarget)) && (
              <View style={s.empty}>
                <Text style={[s.emptyText, { color: colors.textMuted }]}>Enter values above to see results</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function HeroResult({ label, value, sub, color, colors }: { label: string; value: string; sub: string; color: string; colors: any }) {
  return (
    <View style={[s.heroBox, { backgroundColor: color + "14", borderColor: color + "40" }]}>
      <Text style={[s.heroLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[s.heroValue, { color }]}>{value}</Text>
      <Text style={[s.heroSub, { color: colors.textMuted }]}>{sub}</Text>
    </View>
  );
}

function ResultCell({ label, value, color, colors }: { label: string; value: string; color: string; colors: any }) {
  return (
    <View style={[s.resultCell, { backgroundColor: color + "0F", borderColor: color + "26" }]}>
      <Text style={[s.resultCellLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[s.resultCellValue, { color }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  logoBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoIcon: { fontSize: 20, fontWeight: "800" },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 1 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  modeRow: { flexDirection: "row", gap: 8, padding: 12 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  modeBtnText: { fontSize: 14, fontWeight: "600" },
  modeDesc: { fontSize: 13, textAlign: "center", paddingBottom: 12 },
  gstRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, marginBottom: 12 },
  gstLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  gstInput: { flexDirection: "row", alignItems: "center", gap: 4 },
  gstField: { width: 56, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, fontSize: 14, textAlign: "center", fontWeight: "600" },
  gstPct: { fontSize: 14 },
  inputGroup: { padding: 16, paddingTop: 12 },
  inputLabel: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1 },
  inputPrefix: { paddingLeft: 14, fontSize: 16 },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 20, fontWeight: "700" },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  quickBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9999 },
  quickBtnText: { fontSize: 13, fontWeight: "600" },
  resultsHeader: { padding: 14, borderBottomWidth: 1 },
  resultsTitle: { fontSize: 14, fontWeight: "600" },
  resultsBody: { padding: 16 },
  heroBox: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 12 },
  heroLabel: { fontSize: 13, fontWeight: "500" },
  heroValue: { fontSize: 36, fontWeight: "800", marginTop: 4 },
  heroSub: { fontSize: 13, marginTop: 6 },
  resultGrid: { flexDirection: "row", gap: 10, marginBottom: 12 },
  resultCell: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1 },
  resultCellLabel: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
  resultCellValue: { fontSize: 20, fontWeight: "800" },
  resultBox: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  resultBoxLabel: { fontSize: 13, fontWeight: "500" },
  resultBoxValueMd: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  resultBoxSub: { fontSize: 13, marginTop: 4 },
  alertBox: { padding: 14, borderRadius: 12, borderWidth: 1 },
  alertTitle: { fontSize: 14, fontWeight: "600" },
  alertSub: { fontSize: 13, marginTop: 4 },
  empty: { alignItems: "center", paddingVertical: 32 },
  emptyText: { fontSize: 14 },
});
