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

export default function PrivacyPolicyScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const sections = [
    {
      title: "What we collect",
      items: [
        "Email address (when you sign in)",
        "Display name (from Apple/Google, or entered by you)",
        "Generated avatar images (stored temporarily for generation, permanently if you save as Chef Avatar)",
        "App usage analytics (anonymous — which features are used, not personal data)",
      ],
    },
    {
      title: "What we DON'T collect",
      items: [
        "Your original selfie photos — these are processed for AI generation then immediately discarded. We never store your original photos.",
        "Location data",
        "Contacts",
        "Browsing history",
      ],
    },
    {
      title: "Camera & Photos",
      items: [
        "Camera is used only for avatar generation",
        "Photos are resized to 512×512, sent to our AI service, then deleted from our servers after generation",
        "Only the AI-generated result is kept — never the original",
        "Face detection runs on-device before any image is sent",
      ],
    },
    {
      title: "AI Processing",
      items: [
        "Your photos are processed by OpenAI's image generation API",
        "OpenAI does not train on API inputs per their data policy",
        "Generated images are returned to you and stored only if you choose to save",
      ],
    },
    {
      title: "Your Chef Avatar",
      items: [
        "If you set a Chef Avatar, it's stored in our secure cloud storage",
        "You can delete it anytime from Settings",
        "Deleting your account removes all stored data",
      ],
    },
    {
      title: "Referral & Waitlist",
      items: [
        "Your email is stored if you join the waitlist",
        "Referral codes are linked to your account for credit tracking",
        "We don't share your email with third parties",
      ],
    },
    {
      title: "Data Storage",
      items: [
        "All data stored on Supabase (hosted in Sydney, Australia)",
        "Encrypted at rest and in transit",
        "You can request deletion of all your data at any time",
      ],
    },
    {
      title: "Contact",
      items: [
        "Email: privacy@prepmi.au",
        "For data deletion requests: privacy@prepmi.au",
      ],
    },
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          Privacy Policy
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

        {sections.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            {section.items.map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={[s.bullet, { color: colors.textMuted }]}>•</Text>
                <Text style={[s.bodyText, { color: colors.textMuted }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        ))}

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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  bullet: { fontSize: 14, lineHeight: 20 },
  bodyText: { fontSize: 14, lineHeight: 20, flex: 1 },
});
