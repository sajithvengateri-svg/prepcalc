import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { useAuth } from "../../src/contexts/AuthProvider";
import BuyCreditsSheet from "../../src/components/BuyCreditsSheet";

export default function BuyCreditsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [showSheet, setShowSheet] = useState(true);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>Buy Credits</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.center}>
        <TouchableOpacity
          onPress={() => setShowSheet(true)}
          style={[s.openBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={s.openBtnText}>View Credit Packs</Text>
        </TouchableOpacity>
      </View>

      <BuyCreditsSheet
        visible={showSheet}
        onDismiss={() => {
          setShowSheet(false);
          router.back();
        }}
        onSuccess={() => refreshProfile()}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  openBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  openBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
