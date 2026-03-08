import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";

const priceItems = [
  { name: "Wagyu MB5+ Scotch", unit: "/kg", price: "$128.50", change: "+$4.20", up: true },
  { name: "Atlantic Salmon", unit: "/kg", price: "$32.90", change: "-$1.80", up: false },
  { name: "Arborio Rice", unit: "/kg", price: "$5.40", change: "$0.00", up: null },
  { name: "Extra Virgin OO", unit: "/L", price: "$14.20", change: "+$0.60", up: true },
  { name: "Free Range Eggs", unit: "/doz", price: "$6.80", change: "-$0.40", up: false },
];

export default function PriceTrackingScreen() {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Price Tracking</Text>
        <Text style={s.subtitle}>Supplier price movements</Text>
      </View>

      <View style={s.alertBanner}>
        <TrendingUp size={12} color="#DC2626" />
        <Text style={s.alertText}>3 items above threshold this week</Text>
      </View>

      <View style={s.list}>
        {priceItems.map((item, i) => (
          <View key={i} style={s.row}>
            <View style={s.rowLeft}>
              <Text style={s.itemName}>{item.name}</Text>
              <Text style={s.itemUnit}>{item.unit}</Text>
            </View>
            <View style={s.rowRight}>
              <Text style={s.price}>{item.price}</Text>
              <View
                style={[
                  s.changeBadge,
                  {
                    backgroundColor:
                      item.up === true
                        ? "#FEE2E2"
                        : item.up === false
                        ? "#DCFCE7"
                        : "#F3F4F6",
                  },
                ]}
              >
                {item.up === true ? (
                  <TrendingUp size={8} color="#DC2626" />
                ) : item.up === false ? (
                  <TrendingDown size={8} color="#16A34A" />
                ) : (
                  <Minus size={8} color="#6B7280" />
                )}
                <Text
                  style={[
                    s.changeText,
                    {
                      color:
                        item.up === true
                          ? "#DC2626"
                          : item.up === false
                          ? "#16A34A"
                          : "#6B7280",
                    },
                  ]}
                >
                  {item.change}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={s.ctaRow}>
        <Text style={s.ctaText}>Track all supplier prices in Prep Mi Pro</Text>
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
  header: { marginBottom: 6 },
  title: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  subtitle: { fontSize: 10, color: "#6B7280", marginTop: 1 },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 6,
    borderRadius: 6,
    gap: 4,
    marginBottom: 8,
  },
  alertText: { fontSize: 10, color: "#DC2626", fontWeight: "500" },
  list: { gap: 4, flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E8E8E4",
  },
  rowLeft: { flex: 1 },
  itemName: { fontSize: 11, fontWeight: "500", color: "#1A1A1A" },
  itemUnit: { fontSize: 9, color: "#6B7280" },
  rowRight: { alignItems: "flex-end", gap: 2 },
  price: { fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  changeText: { fontSize: 9, fontWeight: "600" },
  ctaRow: {
    backgroundColor: "#DBEAFE",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    alignItems: "center",
  },
  ctaText: { fontSize: 10, color: "#2563EB", fontWeight: "600" },
});
