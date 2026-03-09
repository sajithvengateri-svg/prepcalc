import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
} from "lucide-react-native";

const RING_SIZE = 56;
const STROKE = 4;

const MiniRing = ({
  percent,
  color,
  label,
  value,
}: {
  percent: number;
  color: string;
  label: string;
  value: string;
}) => {
  const r = (RING_SIZE - STROKE * 2) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);

  return (
    <View style={ms.ringItem}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          stroke="#E5E7EB"
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={r}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </Svg>
      <Text style={[ms.ringValue, { color }]}>{value}</Text>
      <Text style={ms.ringLabel}>{label}</Text>
    </View>
  );
};

export default function DashboardScreen() {
  return (
    <View style={ms.container}>
      <View style={ms.header} />

      <View style={ms.ringRow}>
        <MiniRing percent={28} color="#16A34A" label="Food Cost" value="28%" />
        <MiniRing percent={72} color="#2563EB" label="Margin" value="72%" />
        <MiniRing percent={91} color="#D97706" label="Yield" value="91%" />
      </View>

      <View style={ms.statsRow}>
        <View style={ms.statCard}>
          <DollarSign size={14} color="#16A34A" />
          <Text style={ms.statValue}>$12,450</Text>
          <Text style={ms.statLabel}>Revenue</Text>
        </View>
        <View style={ms.statCard}>
          <ShoppingCart size={14} color="#2563EB" />
          <Text style={ms.statValue}>$3,486</Text>
          <Text style={ms.statLabel}>COGS</Text>
        </View>
        <View style={ms.statCard}>
          <TrendingUp size={14} color="#D97706" />
          <Text style={ms.statValue}>+4.2%</Text>
          <Text style={ms.statLabel}>vs Last Wk</Text>
        </View>
      </View>

      <View style={ms.barSection}>
        <Text style={ms.barTitle}>Weekly Trend</Text>
        <View style={ms.barRow}>
          {[65, 72, 58, 80, 75, 68, 82].map((h, i) => (
            <View key={i} style={ms.barWrapper}>
              <View
                style={[
                  ms.bar,
                  {
                    height: h * 0.4,
                    backgroundColor: i === 6 ? "#16A34A" : "#D1D5DB",
                  },
                ]}
              />
              <Text style={ms.barLabel}>
                {["M", "T", "W", "T", "F", "S", "S"][i]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const ms = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    padding: 12,
    borderRadius: 12,
  },
  header: { marginBottom: 10 },
  title: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  subtitle: { fontSize: 10, color: "#6B7280", marginTop: 1 },
  ringRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  ringItem: { alignItems: "center" },
  ringValue: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  ringLabel: { fontSize: 9, color: "#6B7280" },
  statsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E4",
  },
  statValue: { fontSize: 12, fontWeight: "700", color: "#1A1A1A", marginTop: 2 },
  statLabel: { fontSize: 8, color: "#6B7280", marginTop: 1 },
  barSection: { flex: 1 },
  barTitle: { fontSize: 10, fontWeight: "600", color: "#374151", marginBottom: 4 },
  barRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flex: 1,
  },
  barWrapper: { alignItems: "center", flex: 1 },
  bar: { width: 10, borderRadius: 3 },
  barLabel: { fontSize: 8, color: "#9CA3AF", marginTop: 2 },
});
