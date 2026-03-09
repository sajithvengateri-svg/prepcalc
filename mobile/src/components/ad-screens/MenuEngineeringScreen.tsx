import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star, TrendingUp, TrendingDown } from "lucide-react-native";

const menuItems = [
  { name: "Wagyu Scotch", category: "Star", margin: "$46", pop: 92, color: "#16A34A" },
  { name: "Fish & Chips", category: "Plowh.", margin: "$8", pop: 88, color: "#D97706" },
  { name: "Truffle Pasta", category: "Puzzle", margin: "$38", pop: 24, color: "#2563EB" },
  { name: "Garden Salad", category: "Dog", margin: "$4", pop: 15, color: "#DC2626" },
];

const CategoryBadge = ({ cat, color }: { cat: string; color: string }) => (
  <View style={[s.badge, { backgroundColor: color + "18" }]}>
    <Text style={[s.badgeText, { color }]}>{cat}</Text>
  </View>
);

export default function MenuEngineeringScreen() {
  return (
    <View style={s.container}>
      <View style={s.header} />

      {/* 2x2 Matrix */}
      <View style={s.matrix}>
        <View style={s.matrixRow}>
          <View style={[s.quadrant, { backgroundColor: "#DCFCE7" }]}>
            <Star size={14} color="#16A34A" />
            <Text style={[s.quadLabel, { color: "#16A34A" }]}>Stars</Text>
            <Text style={s.quadCount}>4 items</Text>
          </View>
          <View style={[s.quadrant, { backgroundColor: "#DBEAFE" }]}>
            <TrendingUp size={14} color="#2563EB" />
            <Text style={[s.quadLabel, { color: "#2563EB" }]}>Puzzles</Text>
            <Text style={s.quadCount}>3 items</Text>
          </View>
        </View>
        <View style={s.matrixRow}>
          <View style={[s.quadrant, { backgroundColor: "#FEF3C7" }]}>
            <TrendingDown size={14} color="#D97706" />
            <Text style={[s.quadLabel, { color: "#D97706" }]}>Plowhorse</Text>
            <Text style={s.quadCount}>5 items</Text>
          </View>
          <View style={[s.quadrant, { backgroundColor: "#FEE2E2" }]}>
            <Text style={s.dogIcon}>🐕</Text>
            <Text style={[s.quadLabel, { color: "#DC2626" }]}>Dogs</Text>
            <Text style={s.quadCount}>2 items</Text>
          </View>
        </View>
      </View>

      {/* Item list */}
      <View style={s.itemList}>
        {menuItems.map((item, i) => (
          <View key={i} style={s.itemRow}>
            <View style={s.itemLeft}>
              <Text style={s.itemName}>{item.name}</Text>
              <CategoryBadge cat={item.category} color={item.color} />
            </View>
            <View style={s.itemRight}>
              <Text style={s.itemMargin}>{item.margin}</Text>
              <View style={s.popBar}>
                <View
                  style={[
                    s.popFill,
                    { width: `${item.pop}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
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
  matrix: { gap: 4, marginBottom: 8 },
  matrixRow: { flexDirection: "row", gap: 4 },
  quadrant: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  quadLabel: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  quadCount: { fontSize: 8, color: "#6B7280" },
  dogIcon: { fontSize: 14 },
  itemList: { gap: 4 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E8E8E4",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  itemName: { fontSize: 11, fontWeight: "500", color: "#1A1A1A" },
  badge: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  badgeText: { fontSize: 8, fontWeight: "600" },
  itemRight: { alignItems: "flex-end", gap: 2 },
  itemMargin: { fontSize: 11, fontWeight: "600", color: "#1A1A1A" },
  popBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
  },
  popFill: { height: 4, borderRadius: 2 },
});
