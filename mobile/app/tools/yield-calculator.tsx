import React, { useState } from "react";
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
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

const WEIGHT_UNITS = ["g", "kg", "oz", "lb"];

interface ReferenceItem {
  item: string;
  yield: string;
}

const COMMON_YIELDS: ReferenceItem[] = [
  { item: "Whole fish to fillet", yield: "~45-55%" },
  { item: "Bone-in chicken to meat", yield: "~65%" },
  { item: "Whole beef tenderloin to trimmed", yield: "~70%" },
  { item: "Raw prawns to peeled", yield: "~50%" },
  { item: "Vegetables (average)", yield: "~80-90%" },
];

export default function YieldCalculatorScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [itemName, setItemName] = useState("");
  const [rawWeight, setRawWeight] = useState("");
  const [usableWeight, setUsableWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);

  const raw = parseFloat(rawWeight) || 0;
  const usable = parseFloat(usableWeight) || 0;
  const yieldPercent = raw > 0 ? (usable / raw) * 100 : 0;
  const wastePercent = raw > 0 ? 100 - yieldPercent : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yield Calculator</Text>
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
          {/* Input card */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Item Details</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Item Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={itemName}
              onChangeText={setItemName}
              placeholder="e.g. Whole Salmon"
              placeholderTextColor={colors.textMuted}
            />

            {/* Unit picker */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
              Unit
            </Text>
            <TouchableOpacity
              onPress={() => setShowUnitPicker(!showUnitPicker)}
              style={[
                styles.unitDropdown,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.unitDropdownText, { color: colors.text }]}>{unit}</Text>
            </TouchableOpacity>
            {showUnitPicker && (
              <View style={styles.unitPickerRow}>
                {WEIGHT_UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => {
                      setUnit(u);
                      setShowUnitPicker(false);
                    }}
                    style={[
                      styles.unitPill,
                      {
                        backgroundColor: unit === u ? colors.accent : colors.inputBg,
                        borderColor: unit === u ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: unit === u ? "#FFFFFF" : colors.text,
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
              Raw Weight ({unit})
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
              value={rawWeight}
              onChangeText={setRawWeight}
              keyboardType="numeric"
              placeholder="e.g. 5.0"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>
              Usable Weight After Prep ({unit})
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
              value={usableWeight}
              onChangeText={setUsableWeight}
              keyboardType="numeric"
              placeholder="e.g. 2.5"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Results */}
          {raw > 0 && usable > 0 && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Results</Text>

              <View style={styles.resultRow}>
                <View style={[styles.resultBox, { backgroundColor: "#DCFCE7" }]}>
                  <Text style={styles.resultBoxLabel}>Yield</Text>
                  <Text style={[styles.resultBoxValue, { color: "#16A34A" }]}>
                    {yieldPercent.toFixed(1)}%
                  </Text>
                </View>
                <View style={[styles.resultBox, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={styles.resultBoxLabel}>Waste</Text>
                  <Text style={[styles.resultBoxValue, { color: "#DC2626" }]}>
                    {wastePercent.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={[styles.summaryBar, { backgroundColor: colors.surface }]}>
                <View
                  style={[
                    styles.summaryFill,
                    { width: `${Math.min(yieldPercent, 100)}%`, backgroundColor: "#16A34A" },
                  ]}
                />
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                  {usable} {unit} usable from {raw} {unit} raw
                </Text>
              </View>
            </View>
          )}

          {/* Reference accordion */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <TouchableOpacity
              onPress={() => setReferenceOpen(!referenceOpen)}
              style={styles.accordionHeader}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                Common Yields Reference
              </Text>
              {referenceOpen ? (
                <ChevronUp size={20} color={colors.textSecondary} strokeWidth={2} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>

            {referenceOpen && (
              <View style={styles.referenceList}>
                {COMMON_YIELDS.map((ref, i) => (
                  <View
                    key={i}
                    style={[
                      styles.referenceRow,
                      i < COMMON_YIELDS.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.referenceItem, { color: colors.text }]}>
                      {ref.item}
                    </Text>
                    <Text style={[styles.referenceYield, { color: colors.accent }]}>
                      {ref.yield}
                    </Text>
                  </View>
                ))}
              </View>
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
  inputLabel: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  unitDropdown: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  unitDropdownText: { fontSize: 16, fontWeight: "600" },
  unitPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  unitPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resultRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  resultBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  resultBoxLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 4,
  },
  resultBoxValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  summaryBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  summaryFill: {
    height: 8,
    borderRadius: 4,
  },
  summaryRow: {
    alignItems: "center",
  },
  summaryText: { fontSize: 14 },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  referenceList: {
    marginTop: 12,
  },
  referenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  referenceItem: { fontSize: 14, flex: 1 },
  referenceYield: { fontSize: 14, fontWeight: "700" },
});
