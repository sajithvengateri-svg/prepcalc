import React, { useState, useMemo } from "react";
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
import { ChevronLeft, ArrowDown } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

type Category = "Weight" | "Volume" | "Temperature" | "Length";

const CATEGORIES: Category[] = ["Weight", "Volume", "Temperature", "Length"];

const UNIT_MAP: Record<Category, string[]> = {
  Weight: ["g", "kg", "oz", "lb"],
  Volume: ["ml", "L", "tsp", "tbsp", "cup", "fl oz", "pint", "quart", "gallon"],
  Temperature: ["C", "F"],
  Length: ["mm", "cm", "inches"],
};

const DISPLAY_LABELS: Record<string, string> = {
  C: "°C",
  F: "°F",
};

// All weight/volume/length in base units (g, ml, mm)
const TO_BASE: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,
  L: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  "fl oz": 29.5735,
  pint: 473.176,
  quart: 946.353,
  gallon: 3785.41,
  mm: 1,
  cm: 10,
  inches: 25.4,
};

function convert(value: number, from: string, to: string): number {
  // Temperature special case
  if (from === "C" && to === "F") return value * 1.8 + 32;
  if (from === "F" && to === "C") return (value - 32) / 1.8;
  if (from === "C" && to === "C") return value;
  if (from === "F" && to === "F") return value;

  const baseValue = value * (TO_BASE[from] || 1);
  return baseValue / (TO_BASE[to] || 1);
}

export default function UnitConverterScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [category, setCategory] = useState<Category>("Weight");
  const [fromUnit, setFromUnit] = useState("g");
  const [toUnit, setToUnit] = useState("kg");
  const [inputValue, setInputValue] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const units = UNIT_MAP[category];

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const u = UNIT_MAP[cat];
    setFromUnit(u[0]);
    setToUnit(u.length > 1 ? u[1] : u[0]);
    setInputValue("");
    setShowFromPicker(false);
    setShowToPicker(false);
  };

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "";
    const r = convert(num, fromUnit, toUnit);
    return r % 1 === 0 ? r.toString() : r.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  }, [inputValue, fromUnit, toUnit]);

  const label = (u: string) => DISPLAY_LABELS[u] || u;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Unit Converter</Text>
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
          {/* Category pills */}
          <View style={styles.pillRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategoryChange(cat)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: category === cat ? colors.accent : colors.card,
                    borderColor: category === cat ? colors.accent : colors.cardBorder,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: category === cat ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* From */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>From</Text>
            <TouchableOpacity
              onPress={() => {
                setShowFromPicker(!showFromPicker);
                setShowToPicker(false);
              }}
              style={[
                styles.unitDropdown,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.unitDropdownText, { color: colors.text }]}>
                {label(fromUnit)}
              </Text>
              <ArrowDown size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
            {showFromPicker && (
              <View style={styles.pickerList}>
                {units.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => {
                      setFromUnit(u);
                      setShowFromPicker(false);
                    }}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: fromUnit === u ? colors.accentBg : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: fromUnit === u ? colors.accent : colors.text },
                      ]}
                    >
                      {label(u)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput
              style={[
                styles.valueInput,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="Enter value"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* To */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>To</Text>
            <TouchableOpacity
              onPress={() => {
                setShowToPicker(!showToPicker);
                setShowFromPicker(false);
              }}
              style={[
                styles.unitDropdown,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.unitDropdownText, { color: colors.text }]}>
                {label(toUnit)}
              </Text>
              <ArrowDown size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
            {showToPicker && (
              <View style={styles.pickerList}>
                {units.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => {
                      setToUnit(u);
                      setShowToPicker(false);
                    }}
                    style={[
                      styles.pickerItem,
                      {
                        backgroundColor: toUnit === u ? colors.accentBg : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        { color: toUnit === u ? colors.accent : colors.text },
                      ]}
                    >
                      {label(u)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Result */}
            <View
              style={[
                styles.resultBox,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.resultValue,
                  { color: result ? colors.text : colors.textMuted },
                ]}
              >
                {result || "---"}
              </Text>
              <Text style={[styles.resultUnit, { color: colors.textSecondary }]}>
                {label(toUnit)}
              </Text>
            </View>
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
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 14, fontWeight: "600" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  cardLabel: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
  unitDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  unitDropdownText: { fontSize: 16, fontWeight: "600" },
  pickerList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickerItemText: { fontSize: 14, fontWeight: "500" },
  valueInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  resultBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  resultValue: { fontSize: 28, fontWeight: "700" },
  resultUnit: { fontSize: 16, fontWeight: "500" },
});
