import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Sparkles, Zap } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { useAuth } from "../../src/contexts/AuthProvider";

const CREDIT_PACKS = [
  {
    credits: 5,
    price: "$0.99",
    desc: "That's 5 anime chef avatars",
    popular: false,
  },
  {
    credits: 15,
    price: "$1.99",
    desc: "Best value — $0.13 each",
    popular: true,
  },
];

export default function BuyCreditsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { profile } = useAuth();

  const handleBuy = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Coming Soon",
      "Credit purchases are launching shortly. Stay tuned!"
    );
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          Buy Credits
        </Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CREDIT_PACKS.map((pack) => (
          <View
            key={pack.credits}
            style={[
              s.packCard,
              {
                backgroundColor: colors.card,
                borderColor: pack.popular ? colors.accent : colors.cardBorder,
                borderWidth: pack.popular ? 2 : 1,
              },
            ]}
          >
            {pack.popular && (
              <View style={[s.popularBadge, { backgroundColor: colors.accent }]}>
                <Text style={s.popularText}>POPULAR</Text>
              </View>
            )}
            <View style={s.packHeader}>
              <View style={s.packLeft}>
                <Sparkles size={20} color={colors.accent} strokeWidth={2} />
                <Text style={[s.packCredits, { color: colors.text }]}>
                  {pack.credits} credits
                </Text>
              </View>
              <Text style={[s.packPrice, { color: colors.accent }]}>
                {pack.price}
              </Text>
            </View>
            <Text style={[s.packDesc, { color: colors.textMuted }]}>
              {pack.desc}
            </Text>
            <TouchableOpacity
              onPress={handleBuy}
              style={[s.buyBtn, { backgroundColor: colors.accent }]}
            >
              <Zap size={16} color="#FFF" strokeWidth={2} />
              <Text style={s.buyBtnText}>Buy</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={s.infoSection}>
          <Text style={[s.infoText, { color: colors.textMuted }]}>
            All avatars include "Made with PrepCam" watermark.
          </Text>
          <Text style={[s.infoText, { color: colors.textMuted }]}>
            Credits never expire.
          </Text>
        </View>

        {profile && (
          <Text style={[s.creditsRemaining, { color: colors.textMuted }]}>
            {profile.avatarCredits} credits remaining
          </Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollContent: { paddingHorizontal: 20 },
  packCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  popularText: { color: "#FFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  packHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  packLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  packCredits: { fontSize: 18, fontWeight: "700" },
  packPrice: { fontSize: 20, fontWeight: "800" },
  packDesc: { fontSize: 13, marginBottom: 14 },
  buyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buyBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  infoSection: { marginTop: 10, gap: 6, marginBottom: 16 },
  infoText: { fontSize: 13, textAlign: "center" },
  creditsRemaining: { fontSize: 13, textAlign: "center", fontWeight: "600" },
});
