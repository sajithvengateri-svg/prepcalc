import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus, X } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

interface CostIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  costPerUnit: string;
  showUnitPicker: boolean;
}

const UNITS = ["g", "kg", "oz", "lb", "ml", "L", "cup", "tbsp", "tsp", "pcs"];

export default function CostPortionScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [ingredients, setIngredients] = useState<CostIngredient[]>([]);
  const [portions, setPortions] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        quantity: "",
        unit: "g",
        costPerUnit: "",
        showUnitPicker: false,
      },
    ]);
  };

  const updateIngredient = useCallback(
    (id: string, field: keyof CostIngredient, value: string | boolean) => {
      setIngredients((prev) =>
        prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
      );
    },
    []
  );

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const totalCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => {
      const qty = parseFloat(ing.quantity) || 0;
      const cost = parseFloat(ing.costPerUnit) || 0;
      return sum + qty * cost;
    }, 0);
  }, [ingredients]);

  const portionCount = parseFloat(portions) || 0;
  const costPerPortion = portionCount > 0 ? totalCost / portionCount : 0;
  const sell = parseFloat(sellPrice) || 0;
  const foodCostPercent = sell > 0 ? (costPerPortion / sell) * 100 : 0;
  const margin = sell > 0 ? sell - costPerPortion : 0;

  const getCostColor = (pct: number): string => {
    if (pct <= 0) return colors.textMuted;
    if (pct < 30) return "#16A34A";
    if (pct <= 35) return "#D97706";
    return "#DC2626";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cost / Portion</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ingredients */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>

            {ingredients.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Add ingredients to calculate costs.
              </Text>
            )}

            {ingredients.map((ing) => (
              <View key={ing.id} style={[styles.ingredientRow, { borderColor: colors.border }]}>
                <View style={styles.rowTop}>
                  <TextInput
                    style={[
                      styles.nameInput,
                      {
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={ing.name}
                    onChangeText={(v) => updateIngredient(ing.id, "name", v)}
                    placeholder="Ingredient"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => removeIngredient(ing.id)} style={styles.removeBtn}>
                    <X size={18} color={colors.destructive} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <View style={styles.rowBottom}>
                  <TextInput
                    style={[
                      styles.smallInput,
                      {
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={ing.quantity}
                    onChangeText={(v) => updateIngredient(ing.id, "quantity", v)}
                    keyboardType="numeric"
                    placeholder="Qty"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      updateIngredient(ing.id, "showUnitPicker", !ing.showUnitPicker)
                    }
                    style={[
                      styles.unitSelector,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.unitText, { color: colors.text }]}>{ing.unit}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.smallInput,
                      {
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: colors.border,
                        flex: 1,
                      },
                    ]}
                    value={ing.costPerUnit}
                    onChangeText={(v) => updateIngredient(ing.id, "costPerUnit", v)}
                    keyboardType="numeric"
                    placeholder="$/unit"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                {ing.showUnitPicker && (
                  <View style={styles.unitPickerRow}>
                    {UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => {
                          updateIngredient(ing.id, "unit", u);
                          updateIngredient(ing.id, "showUnitPicker", false);
                        }}
                        style={[
                          styles.unitPill,
                          {
                            backgroundColor: ing.unit === u ? colors.accent : colors.inputBg,
                            borderColor: ing.unit === u ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: ing.unit === u ? "#FFFFFF" : colors.text,
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={addIngredient}
              style={[styles.addBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          {/* Totals */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Totals</Text>

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                Total Recipe Cost
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                ${totalCost.toFixed(2)}
              </Text>
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Number of Portions
              </Text>
              <TextInput
                style={[
                  styles.compactInput,
                  {
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={portions}
                onChangeText={setPortions}
                keyboardType="numeric"
                placeholder="e.g. 8"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={[styles.costPerPortionBox, { backgroundColor: colors.accentBg }]}>
              <Text style={[styles.costPerPortionLabel, { color: colors.textSecondary }]}>
                Cost per Portion
              </Text>
              <Text style={[styles.costPerPortionValue, { color: colors.accent }]}>
                ${costPerPortion.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Margin */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Margin Analysis</Text>

            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Sell Price (optional)
              </Text>
              <TextInput
                style={[
                  styles.compactInput,
                  {
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={sellPrice}
                onChangeText={setSellPrice}
                keyboardType="numeric"
                placeholder="$0.00"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {sell > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                    Food Cost %
                  </Text>
                  <Text
                    style={[
                      styles.totalValue,
                      { color: getCostColor(foodCostPercent), fontWeight: "700" },
                    ]}
                  >
                    {foodCostPercent.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                    Margin per Portion
                  </Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>
                    ${margin.toFixed(2)}
                  </Text>
                </View>

                {/* Color indicator */}
                <View
                  style={[
                    styles.indicator,
                    { backgroundColor: getCostColor(foodCostPercent) + "1A" },
                  ]}
                >
                  <View
                    style={[styles.indicatorDot, { backgroundColor: getCostColor(foodCostPercent) }]}
                  />
                  <Text style={[styles.indicatorText, { color: getCostColor(foodCostPercent) }]}>
                    {foodCostPercent < 30
                      ? "Great margins"
                      : foodCostPercent <= 35
                      ? "Acceptable margins"
                      : "Margins too tight"}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 8 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 16 },
  ingredientRow: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  removeBtn: { padding: 6 },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallInput: {
    width: 72,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  unitSelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 50,
    alignItems: "center",
  },
  unitText: { fontSize: 14, fontWeight: "600" },
  unitPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  unitPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: { fontSize: 14, fontWeight: "500" },
  totalValue: { fontSize: 18, fontWeight: "700" },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: { fontSize: 14, fontWeight: "500", flex: 1 },
  compactInput: {
    width: 100,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  costPerPortionBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  costPerPortionLabel: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  costPerPortionValue: { fontSize: 32, fontWeight: "700" },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorText: { fontSize: 14, fontWeight: "600" },
});
