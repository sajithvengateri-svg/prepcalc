import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

export default function TermsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const terms = [
    "You must be 13 or older to use this app.",
    "Generated avatar images may include a \"Made with PrepCam\" watermark.",
    "You own your generated images but grant us permission to display the watermark.",
    "Don't use the avatar generator to create harmful, abusive, or illegal content.",
    "Don't attempt to bypass the AI safety filters.",
    "Free credits are non-transferable and may expire.",
    "Paid credit packs are non-refundable once credits are used.",
    "We may modify pricing, features, or credit allocations at any time.",
    "We reserve the right to suspend accounts that violate these terms.",
  ];

  const disclaimers = [
    "Kitchen reference data (butchery charts, temperatures, allergens) is for informational purposes only.",
    "Always follow your local food safety authority's guidelines.",
    "PrepCam is not a substitute for professional food safety training.",
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          Terms of Service
        </Text>
        <View style={s.backBtn} />
      </View>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.subtitle, { color: colors.textMuted }]}>
          PrepCam by Prep Mi{"\n"}Last updated: March 2026
        </Text>

        <Text style={[s.intro, { color: colors.textMuted }]}>
          By using PrepCam, you agree to:
        </Text>

        {terms.map((term, i) => (
          <View key={i} style={s.termRow}>
            <Text style={[s.termNum, { color: colors.accent }]}>{i + 1}.</Text>
            <Text style={[s.termText, { color: colors.textMuted }]}>
              {term}
            </Text>
          </View>
        ))}

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>
            Disclaimer
          </Text>
          {disclaimers.map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={[s.bullet, { color: colors.textMuted }]}>•</Text>
              <Text style={[s.bodyText, { color: colors.textMuted }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[s.footer, { color: colors.textMuted }]}>
          Prep Mi Pty Ltd{"\n"}Brisbane, Australia
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
  subtitle: { fontSize: 13, marginBottom: 20, lineHeight: 20 },
  intro: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  termRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  termNum: { fontSize: 14, fontWeight: "700", lineHeight: 20, width: 20 },
  termText: { fontSize: 14, lineHeight: 20, flex: 1 },
  section: { marginTop: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  bullet: { fontSize: 14, lineHeight: 20 },
  bodyText: { fontSize: 14, lineHeight: 20, flex: 1 },
  footer: { fontSize: 13, textAlign: "center", marginTop: 24, lineHeight: 20 },
});
