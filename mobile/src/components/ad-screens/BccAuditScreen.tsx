import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react-native";

const auditItems = [
  { task: "Coolroom temp check", status: "pass", time: "6:02 AM" },
  { task: "Freezer temp log", status: "pass", time: "6:05 AM" },
  { task: "Handwash station", status: "warning", time: "6:15 AM" },
  { task: "Delivery temp check", status: "fail", time: "7:30 AM" },
  { task: "Prep area sanitise", status: "pending", time: "—" },
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pass":
      return <CheckCircle size={14} color="#16A34A" />;
    case "warning":
      return <AlertTriangle size={14} color="#D97706" />;
    case "fail":
      return <XCircle size={14} color="#DC2626" />;
    default:
      return <Clock size={14} color="#9CA3AF" />;
  }
};

const statusColor: Record<string, string> = {
  pass: "#DCFCE7",
  warning: "#FEF3C7",
  fail: "#FEE2E2",
  pending: "#F3F4F6",
};

export default function BccAuditScreen() {
  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>BCC Audit Trail</Text>
        <Text style={s.subtitle}>Daily compliance checklist</Text>
      </View>

      {/* Score ring */}
      <View style={s.scoreRow}>
        <View style={s.scoreCircle}>
          <Text style={s.scoreValue}>72%</Text>
        </View>
        <View style={s.scoreInfo}>
          <Text style={s.scoreLabel}>Compliance Score</Text>
          <Text style={s.scoreDetail}>2 passed · 1 warning · 1 fail · 1 pending</Text>
        </View>
      </View>

      {/* Checklist */}
      <View style={s.list}>
        {auditItems.map((item, i) => (
          <View key={i} style={[s.row, { backgroundColor: statusColor[item.status] }]}>
            <StatusIcon status={item.status} />
            <View style={s.rowText}>
              <Text style={s.taskName}>{item.task}</Text>
              <Text style={s.taskTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.ctaRow}>
        <Text style={s.ctaText}>Full BCC audit system in Prep Mi Pro</Text>
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
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#D97706",
  },
  scoreValue: { fontSize: 14, fontWeight: "700", color: "#D97706" },
  scoreInfo: { flex: 1 },
  scoreLabel: { fontSize: 12, fontWeight: "600", color: "#1A1A1A" },
  scoreDetail: { fontSize: 9, color: "#6B7280", marginTop: 1 },
  list: { gap: 3, flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    gap: 8,
  },
  rowText: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  taskName: { fontSize: 11, fontWeight: "500", color: "#1A1A1A" },
  taskTime: { fontSize: 10, color: "#6B7280" },
  ctaRow: {
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    alignItems: "center",
  },
  ctaText: { fontSize: 10, color: "#D97706", fontWeight: "600" },
});
