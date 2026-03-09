import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Linking,
  Platform,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  Users,
  Shield,
  FileText,
  MessageSquare,
  ChevronRight,
  Sparkles,
  LogOut,
  Camera,
  Volume2,
  Check,
  Gift,
  CreditCard,
  Copy,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useTheme, THEMES } from "../../src/contexts/ThemeProvider";
import { useAuth } from "../../src/contexts/AuthProvider";
import { useTimerVoice, VOICE_OPTIONS, type VoiceStyle } from "../../src/hooks/useTimerVoice";

const FEATURE_PREVIEW_KEY = "show_feature_preview";

export default function SettingsScreen() {
  const { themeId, colors, isDark, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const { voiceStyle, updateVoice, preview } = useTimerVoice();
  const [chefAvatar, setChefAvatar] = useState<string | null>(null);
  const [showFeaturePreview, setShowFeaturePreview] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(FEATURE_PREVIEW_KEY).then((val) => {
      if (val !== null) setShowFeaturePreview(val === "true");
    });
    AsyncStorage.getItem("chef_avatar_url").then((url) => {
      if (url) setChefAvatar(url);
    });
  }, []);

  const toggleFeaturePreview = (value: boolean) => {
    setShowFeaturePreview(value);
    AsyncStorage.setItem(FEATURE_PREVIEW_KEY, String(value));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Appearance */}
        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
          APPEARANCE
        </Text>
        <View style={s.themeGrid}>
          {THEMES.map((theme) => {
            const active = themeId === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                onPress={() => {
                  tap();
                  setTheme(theme.id);
                }}
                style={[
                  s.themeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: active ? colors.accent : colors.cardBorder,
                    borderWidth: active ? 2 : 1,
                  },
                ]}
              >
                <View style={s.swatchRow}>
                  {theme.swatches.map((color, i) => (
                    <View
                      key={i}
                      style={[
                        s.swatch,
                        {
                          backgroundColor: color,
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.1)",
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[s.themeLabel, { color: colors.text }]}>
                  {theme.label}
                </Text>
                <Text style={[s.themeDesc, { color: colors.textMuted }]}>
                  {theme.desc}
                </Text>
                {active && (
                  <View
                    style={[s.activeDot, { backgroundColor: colors.accent }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Account */}
        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
          ACCOUNT
        </Text>
        <View
          style={[
            s.menuCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {user && profile ? (
            <>
              <View style={[s.menuRow, { borderBottomColor: colors.border }]}>
                <View style={s.menuLeft}>
                  {chefAvatar ? (
                    <Image
                      source={{ uri: chefAvatar }}
                      style={s.profileAvatar}
                    />
                  ) : (
                    <View style={[s.menuIconWrap, { backgroundColor: colors.accentBg }]}>
                      <Camera size={16} color={colors.accent} strokeWidth={2} />
                    </View>
                  )}
                  <View>
                    <Text style={[s.menuLabel, { color: colors.text }]}>
                      {profile.displayName}
                    </Text>
                    <Text style={[s.menuSub, { color: colors.textMuted }]}>
                      {profile.email}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[s.menuRow, { borderBottomColor: colors.border }]}>
                <View style={s.menuLeft}>
                  <View style={[s.menuIconWrap, { backgroundColor: colors.accentBg }]}>
                    <Sparkles size={16} color={colors.accent} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={[s.menuLabel, { color: colors.text }]}>Avatar Credits</Text>
                    <Text style={[s.menuSub, { color: colors.textMuted }]}>
                      {profile.avatarCredits} remaining
                    </Text>
                  </View>
                </View>
                <View style={[s.badge, { backgroundColor: colors.accentBg }]}>
                  <Text style={[s.badgeText, { color: colors.accent }]}>{profile.avatarCredits}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.menuRow} onPress={handleSignOut}>
                <View style={s.menuLeft}>
                  <View style={[s.menuIconWrap, { backgroundColor: colors.destructiveBg }]}>
                    <LogOut size={16} color={colors.destructive} strokeWidth={2} />
                  </View>
                  <Text style={[s.menuLabel, { color: colors.destructive }]}>Sign Out</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[s.menuRow, { borderBottomColor: colors.border }]}>
                <View style={s.menuLeft}>
                  <View style={[s.menuIconWrap, { backgroundColor: colors.accentBg }]}>
                    <Sparkles size={16} color={colors.accent} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={[s.menuLabel, { color: colors.text }]}>AI Credits</Text>
                    <Text style={[s.menuSub, { color: colors.textMuted }]}>3 free scans per day</Text>
                  </View>
                </View>
                <View style={[s.badge, { backgroundColor: colors.accentBg }]}>
                  <Text style={[s.badgeText, { color: colors.accent }]}>Free</Text>
                </View>
              </View>
              <View style={s.menuRow}>
                <View style={s.menuLeft}>
                  <View style={[s.menuIconWrap, { backgroundColor: colors.accentBg }]}>
                    <Camera size={16} color={colors.accent} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={[s.menuLabel, { color: colors.text }]}>Sign in to unlock Avatar Studio</Text>
                    <Text style={[s.menuSub, { color: colors.textMuted }]}>3 free avatars waiting</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
              </View>
            </>
          )}
        </View>

        {/* During Avatar Generation */}
        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
          DURING AVATAR GENERATION
        </Text>
        <View
          style={[
            s.menuCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={s.menuRow}>
            <View style={[s.menuLeft, { flex: 1 }]}>
              <View style={[s.menuIconWrap, { backgroundColor: colors.accentBg }]}>
                <Sparkles size={16} color={colors.accent} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.menuLabel, { color: colors.text }]}>
                  Show feature preview
                </Text>
                <Text style={[s.menuSub, { color: colors.textMuted }]}>
                  See what's coming to Prep Mi while your avatar generates
                </Text>
              </View>
            </View>
            <Switch
              value={showFeaturePreview}
              onValueChange={toggleFeaturePreview}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Timer Voice */}
        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
          TIMER VOICE
        </Text>
        <View
          style={[
            s.menuCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {VOICE_OPTIONS.map((opt, idx) => {
            const isActive = voiceStyle === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  tap();
                  updateVoice(opt.id);
                  preview(opt.id);
                }}
                style={[
                  s.menuRow,
                  {
                    borderBottomColor:
                      idx < VOICE_OPTIONS.length - 1 ? colors.border : "transparent",
                  },
                ]}
              >
                <View style={s.menuLeft}>
                  <View
                    style={[
                      s.menuIconWrap,
                      {
                        backgroundColor: isActive ? colors.accentBg : colors.surface,
                      },
                    ]}
                  >
                    <Volume2
                      size={16}
                      color={isActive ? colors.accent : colors.textMuted}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={[s.menuLabel, { color: colors.text }]}>
                    {opt.label}
                  </Text>
                </View>
                {isActive && (
                  <Check size={18} color={colors.accent} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Credits & Sharing */}
        {user && profile && (
          <>
            <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
              CREDITS & SHARING
            </Text>
            <View
              style={[
                s.menuCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <TouchableOpacity
                style={[s.menuRow, { borderBottomColor: colors.border }]}
                onPress={() => { tap(); router.push("/settings/share-earn"); }}
              >
                <View style={s.menuLeft}>
                  <View style={[s.menuIconWrap, { backgroundColor: "#FEF3C7" }]}>
                    <Gift size={16} color="#D97706" strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={[s.menuLabel, { color: colors.text }]}>
                      Share PrepCam — Earn Credits
                    </Text>
                    <Text style={[s.menuSub, { color: colors.textMuted }]}>
                      {profile.referralCreditsEarned ?? 0} / 10 referral credits earned
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.menuRow, { borderBottomColor: colors.border }]}
                onPress={() => { tap(); router.push("/settings/buy-credits"); }}
              >
                <View style={s.menuLeft}>
                  <View style={[s.menuIconWrap, { backgroundColor: "#E0E7FF" }]}>
                    <CreditCard size={16} color="#4F46E5" strokeWidth={2} />
                  </View>
                  <Text style={[s.menuLabel, { color: colors.text }]}>
                    Buy More Credits
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
              {profile.referralCode && (
                <TouchableOpacity
                  style={s.menuRow}
                  onPress={async () => {
                    await Clipboard.setStringAsync(profile.referralCode!);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert("Copied!", "Referral code copied to clipboard.");
                  }}
                >
                  <View style={s.menuLeft}>
                    <View style={[s.menuIconWrap, { backgroundColor: colors.accentBg }]}>
                      <Copy size={16} color={colors.accent} strokeWidth={2} />
                    </View>
                    <View>
                      <Text style={[s.menuLabel, { color: colors.text }]}>
                        Your Code: {profile.referralCode}
                      </Text>
                      <Text style={[s.menuSub, { color: colors.textMuted }]}>
                        Tap to copy
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* About */}
        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>ABOUT</Text>
        <View
          style={[
            s.menuCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <TouchableOpacity
            style={[s.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => {
              tap();
              router.push("/settings/privacy");
            }}
          >
            <View style={s.menuLeft}>
              <View
                style={[s.menuIconWrap, { backgroundColor: "#DBEAFE" }]}
              >
                <Shield size={16} color="#2563EB" strokeWidth={2} />
              </View>
              <Text style={[s.menuLabel, { color: colors.text }]}>
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => {
              tap();
              router.push("/settings/terms");
            }}
          >
            <View style={s.menuLeft}>
              <View
                style={[s.menuIconWrap, { backgroundColor: "#E0E7FF" }]}
              >
                <FileText size={16} color="#4F46E5" strokeWidth={2} />
              </View>
              <Text style={[s.menuLabel, { color: colors.text }]}>
                Terms of Service
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.menuRow}
            onPress={() => {
              tap();
              const appVersion = Constants.expoConfig?.version || "1.0.0";
              const deviceInfo = `${Platform.OS} ${Platform.Version}`;
              const body = encodeURIComponent(`\n\n---\nApp: PrepCam v${appVersion}\nDevice: ${deviceInfo}`);
              Linking.openURL(`mailto:feedback@prepmi.au?subject=PrepCam%20Feedback&body=${body}`);
            }}
          >
            <View style={s.menuLeft}>
              <View
                style={[s.menuIconWrap, { backgroundColor: "#DCFCE7" }]}
              >
                <MessageSquare size={16} color="#16A34A" strokeWidth={2} />
              </View>
              <Text style={[s.menuLabel, { color: colors.text }]}>
                Send Feedback
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <Text style={[s.footer, { color: colors.textMuted }]}>
          PrepCam by Prep Mi · v{Constants.expoConfig?.version || "1.0.0"}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 },
  scrollContent: { paddingHorizontal: 16 },
  header: { paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  // Theme
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  themeCard: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    position: "relative",
  },
  swatchRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  swatch: { width: 22, height: 22, borderRadius: 11 },
  themeLabel: { fontSize: 14, fontWeight: "700" },
  themeDesc: { fontSize: 11, marginTop: 2 },
  activeDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Menu
  menuCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  menuLabel: { fontSize: 14, fontWeight: "500" },
  menuSub: { fontSize: 12, marginTop: 1 },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
  },
});
