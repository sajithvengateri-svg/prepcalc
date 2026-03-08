import React, { useState, useCallback } from "react";
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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus, Trash2, X } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

const UNITS = ["g", "kg", "oz", "lb", "ml", "L", "tsp", "tbsp", "cup", "pcs", "pinch"];

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  showUnitPicker: boolean;
}

export default function RecipeScalerScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [originalServings, setOriginalServings] = useState("");
  const [desiredServings, setDesiredServings] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const multiplier =
    parseFloat(originalServings) > 0 && parseFloat(desiredServings) > 0
      ? parseFloat(desiredServings) / parseFloat(originalServings)
      : 1;

  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        quantity: "",
        unit: "g",
        showUnitPicker: false,
      },
    ]);
  };

  const updateIngredient = useCallback(
    (id: string, field: keyof Ingredient, value: string | boolean) => {
      setIngredients((prev) =>
        prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
      );
    },
    []
  );

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const resetAll = () => {
    Alert.alert("Reset", "Clear all ingredients and servings?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setOriginalServings("");
          setDesiredServings("");
          setIngredients([]);
        },
      },
    ]);
  };

  const getScaledQty = (qty: string): string => {
    const num = parseFloat(qty);
    if (isNaN(num)) return "";
    const scaled = num * multiplier;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recipe Scaler</Text>
        <TouchableOpacity onPress={resetAll} style={styles.resetBtn}>
          <Text style={[styles.resetText, { color: colors.destructive }]}>Reset</Text>
        </TouchableOpacity>
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
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Servings</Text>
            <View style={styles.servingsRow}>
              <View style={styles.servingInput}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Original
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={originalServings}
                  onChangeText={setOriginalServings}
                  keyboardType="numeric"
                  placeholder="e.g. 4"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.servingInput}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Desired
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={desiredServings}
                  onChangeText={setDesiredServings}
                  keyboardType="numeric"
                  placeholder="e.g. 10"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
            {multiplier !== 1 && (
              <View style={[styles.multiplierBadge, { backgroundColor: colors.accentBg }]}>
                <Text style={[styles.multiplierText, { color: colors.accent }]}>
                  x{multiplier % 1 === 0 ? multiplier : multiplier.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>

            {ingredients.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No ingredients added yet. Tap the button below to start.
              </Text>
            )}

            {ingredients.map((ing) => (
              <View key={ing.id} style={[styles.ingredientRow, { borderColor: colors.border }]}>
                <View style={styles.ingredientTop}>
                  <TextInput
                    style={[
                      styles.ingredientNameInput,
                      {
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={ing.name}
                    onChangeText={(v) => updateIngredient(ing.id, "name", v)}
                    placeholder="Ingredient name"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() => removeIngredient(ing.id)}
                    style={styles.removeBtn}
                  >
                    <X size={18} color={colors.destructive} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <View style={styles.ingredientBottom}>
                  <TextInput
                    style={[
                      styles.qtyInput,
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
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.unitText, { color: colors.text }]}>{ing.unit}</Text>
                  </TouchableOpacity>
                  {ing.quantity && multiplier !== 1 ? (
                    <View style={[styles.scaledBadge, { backgroundColor: colors.accentBg }]}>
                      <Text style={[styles.scaledText, { color: colors.accent }]}>
                        {getScaledQty(ing.quantity)} {ing.unit}
                      </Text>
                    </View>
                  ) : null}
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
                            backgroundColor:
                              ing.unit === u ? colors.accent : colors.inputBg,
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
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 8, flex: 1 },
  resetBtn: { padding: 4 },
  resetText: { fontSize: 15, fontWeight: "600" },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  servingsRow: { flexDirection: "row", gap: 12 },
  servingInput: { flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  multiplierBadge: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  multiplierText: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 20 },
  ingredientRow: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  ingredientTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  ingredientNameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  removeBtn: { padding: 6 },
  ingredientBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "600",
  },
  unitSelector: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 56,
    alignItems: "center",
  },
  unitText: { fontSize: 14, fontWeight: "600" },
  scaledBadge: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scaledText: { fontSize: 14, fontWeight: "700" },
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
});
