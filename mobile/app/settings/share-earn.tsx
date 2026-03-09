import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Copy,
  Share2,
  Gift,
} from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { useAuth } from "../../src/contexts/AuthProvider";

const MAX_REFERRAL_CREDITS = 10;

export default function ShareEarnScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.referralCode || "---";
  const creditsEarned = profile?.referralCreditsEarned ?? 0;
  const progress = Math.min(creditsEarned / MAX_REFERRAL_CREDITS, 1);

  const shareMessage = `Hey! Check out PrepCam — it turns your selfie into an anime chef avatar. It's free and actually hilarious. Use my code ${referralCode} and we both get bonus credits.\n\nhttps://apps.apple.com/app/prepcam/id`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: shareMessage });
    } catch {
      // User cancelled
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          Share & Earn
        </Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[s.heroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[s.heroIcon, { backgroundColor: colors.accentBg }]}>
            <Gift size={28} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={[s.heroTitle, { color: colors.text }]}>
            Share PrepCam with friends
          </Text>
          <Text style={[s.heroSub, { color: colors.textMuted }]}>
            Each friend who joins = 1 credit.{"\n"}Up to {MAX_REFERRAL_CREDITS} bonus credits.
          </Text>
        </View>

        {/* Progress */}
        <View style={[s.progressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={s.progressHeader}>
            <Text style={[s.progressLabel, { color: colors.text }]}>
              Credits earned
            </Text>
            <Text style={[s.progressCount, { color: colors.accent }]}>
              {creditsEarned} / {MAX_REFERRAL_CREDITS}
            </Text>
          </View>
          <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                s.progressFill,
                { backgroundColor: colors.accent, width: `${progress * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Referral Code */}
        <View style={[s.codeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[s.codeLabel, { color: colors.textMuted }]}>
            Your referral code
          </Text>
          <View style={s.codeRow}>
            <Text style={[s.codeText, { color: colors.text }]}>
              {referralCode}
            </Text>
            <TouchableOpacity
              onPress={handleCopyCode}
              style={[s.copyBtn, { backgroundColor: colors.accentBg }]}
            >
              <Copy size={14} color={colors.accent} strokeWidth={2} />
              <Text style={[s.copyText, { color: colors.accent }]}>
                {copied ? "Copied!" : "Copy"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          style={[s.shareBtn, { backgroundColor: colors.accent }]}
        >
          <Share2 size={18} color="#FFF" strokeWidth={2} />
          <Text style={s.shareBtnText}>Share with a Friend</Text>
        </TouchableOpacity>

        <Text style={[s.footerNote, { color: colors.textMuted }]}>
          When friends sign up with your code, you both get a free credit.
        </Text>

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
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  heroSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  progressCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 14, fontWeight: "500" },
  progressCount: { fontSize: 14, fontWeight: "700" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  codeCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  codeLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeText: { fontSize: 20, fontWeight: "800", letterSpacing: 1 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copyText: { fontSize: 13, fontWeight: "600" },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  shareBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  footerNote: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
