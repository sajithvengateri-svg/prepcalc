import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Scan, Sparkles, Camera, Zap } from "lucide-react-native";

export default function AiScannerScreen() {
  return (
    <View style={s.container}>
      <View style={s.header} />

      {/* Scanner preview mock */}
      <View style={s.scannerBox}>
        <View style={s.cornerTL} />
        <View style={s.cornerTR} />
        <View style={s.cornerBL} />
        <View style={s.cornerBR} />
        <View style={s.scanContent}>
          <Camera size={28} color="#22C55E" />
          <Text style={s.scanText}>Point at invoice</Text>
        </View>
        <View style={s.scanLine} />
      </View>

      {/* Extracted data preview */}
      <View style={s.extractedSection}>
        <View style={s.extractHeader}>
          <Sparkles size={12} color="#8B5CF6" />
          <Text style={s.extractTitle}>AI Extracted</Text>
        </View>
        <View style={s.extractRow}>
          <Text style={s.extractLabel}>Supplier</Text>
          <Text style={s.extractValue}>BioPak Wholesale</Text>
        </View>
        <View style={s.extractRow}>
          <Text style={s.extractLabel}>Invoice #</Text>
          <Text style={s.extractValue}>INV-20241127</Text>
        </View>
        <View style={s.extractRow}>
          <Text style={s.extractLabel}>Total</Text>
          <Text style={[s.extractValue, { color: "#16A34A", fontWeight: "700" }]}>
            $847.20
          </Text>
        </View>
        <View style={s.extractRow}>
          <Text style={s.extractLabel}>Items</Text>
          <Text style={s.extractValue}>12 line items detected</Text>
        </View>
      </View>

      <View style={s.featureRow}>
        <View style={s.featureItem}>
          <Zap size={12} color="#D97706" />
          <Text style={s.featureText}>2s scan</Text>
        </View>
        <View style={s.featureItem}>
          <Sparkles size={12} color="#8B5CF6" />
          <Text style={s.featureText}>99% accuracy</Text>
        </View>
        <View style={s.featureItem}>
          <Scan size={12} color="#16A34A" />
          <Text style={s.featureText}>Auto-categorise</Text>
        </View>
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
  scannerBox: {
    height: 100,
    backgroundColor: "#0F0F0F",
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  scanContent: { alignItems: "center", gap: 4 },
  scanText: { fontSize: 10, color: "#22C55E", fontWeight: "500" },
  scanLine: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: "#22C55E",
    top: "45%",
    opacity: 0.6,
  },
  cornerTL: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#22C55E",
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#22C55E",
    borderTopRightRadius: 4,
  },
  cornerBL: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#22C55E",
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#22C55E",
    borderBottomRightRadius: 4,
  },
  extractedSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E8E8E4",
    marginBottom: 8,
  },
  extractHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  extractTitle: { fontSize: 11, fontWeight: "600", color: "#8B5CF6" },
  extractRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  extractLabel: { fontSize: 10, color: "#6B7280" },
  extractValue: { fontSize: 10, fontWeight: "500", color: "#1A1A1A" },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  featureItem: { alignItems: "center", gap: 2 },
  featureText: { fontSize: 9, color: "#6B7280", fontWeight: "500" },
});
