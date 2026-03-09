import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DollarSign, ChevronRight } from "lucide-react-native";

const ingredients = [
  { name: "Wagyu Scotch Fillet", qty: "200g", cost: "$14.80" },
  { name: "Truffle Oil", qty: "5ml", cost: "$1.20" },
  { name: "Kipfler Potatoes", qty: "120g", cost: "$0.45" },
  { name: "Broccolini", qty: "80g", cost: "$0.65" },
  { name: "Jus (reduced)", qty: "60ml", cost: "$0.90" },
];

export default function RecipeCostingScreen() {
  return (
    <View style={s.container}>
      <View style={s.header} />

      <View style={s.ingredientList}>
        {ingredients.map((ing, i) => (
          <View key={i} style={s.ingredientRow}>
            <View style={s.ingredientLeft}>
              <Text style={s.ingName}>{ing.name}</Text>
              <Text style={s.ingQty}>{ing.qty}</Text>
            </View>
            <Text style={s.ingCost}>{ing.cost}</Text>
          </View>
        ))}
      </View>

      <View style={s.divider} />

      <View style={s.summaryRow}>
        <Text style={s.summaryLabel}>Total Cost</Text>
        <Text style={s.summaryValue}>$18.00</Text>
      </View>
      <View style={s.summaryRow}>
        <Text style={s.summaryLabel}>Sell Price (28%)</Text>
        <Text style={[s.summaryValue, { color: "#16A34A" }]}>$64.29</Text>
      </View>
      <View style={s.summaryRow}>
        <Text style={s.summaryLabel}>Margin</Text>
        <Text style={[s.summaryValue, { color: "#2563EB" }]}>$46.29</Text>
      </View>

      <View style={s.ctaRow}>
        <DollarSign size={12} color="#16A34A" />
        <Text style={s.ctaText}>Full recipe costing in Prep Mi Pro</Text>
        <ChevronRight size={12} color="#9CA3AF" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    padding: 12,
    borderRadius: 12,
  },
  header: { marginBottom: 8 },
  title: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  subtitle: { fontSize: 10, color: "#6B7280", marginTop: 1 },
  ingredientList: { gap: 4 },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E8E8E4",
  },
  ingredientLeft: { flex: 1 },
  ingName: { fontSize: 11, fontWeight: "500", color: "#1A1A1A" },
  ingQty: { fontSize: 9, color: "#6B7280" },
  ingCost: { fontSize: 11, fontWeight: "600", color: "#1A1A1A" },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryLabel: { fontSize: 11, color: "#6B7280" },
  summaryValue: { fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  ctaText: { fontSize: 10, color: "#16A34A", fontWeight: "600", flex: 1 },
});
