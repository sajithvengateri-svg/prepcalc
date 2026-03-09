import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Camera,
  Calculator,
  ArrowLeftRight,
  Clock,
  Percent,
  Check,
  ChevronRight,
  Columns2,
  CreditCard,
  Users,
  Lock,
  X,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { useAuth } from "../../src/contexts/AuthProvider";
import { joinWaitlist } from "../../src/lib/waitlist";

const CHEF_AVATAR_KEY = "chef_avatar_url";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function getGreeting(userName?: string): string {
  if (userName) {
    return `Yes, Chef. ${userName}`;
  }
  return "Yes, Chef";
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user, profile } = useAuth();
  const router = useRouter();

  // Chef avatar
  const [chefAvatar, setChefAvatar] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(CHEF_AVATAR_KEY).then((url) => {
      if (url) setChefAvatar(url);
    });
  }, []);

  // Animations
  const glowAnim = useRef(new Animated.Value(1)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;
  const shutterAnim = useRef(new Animated.Value(0)).current;
  const lensRotate = useRef(new Animated.Value(0)).current;

  // Style pills
  const [selectedStyle, setSelectedStyle] = useState("Anime");
  const styles_list = ["Anime", "Ghibli", "Pixel", "Comic"];

  // CTA popup (show once after first share)
  const [showCtaPopup, setShowCtaPopup] = useState(false);
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaSubmitting, setCtaSubmitting] = useState(false);
  const [ctaJoined, setCtaJoined] = useState(false);

  // Bottom waitlist
  const [waitlistEmail2, setWaitlistEmail2] = useState("");
  const [waitlistSubmitting2, setWaitlistSubmitting2] = useState(false);
  const [waitlistJoined2, setWaitlistJoined2] = useState(false);

  // Animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.06,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(lensRotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(shutterAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(shutterAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBubblePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(bubbleScale, {
        toValue: 0.94,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    router.push("/(tabs)/avatar");
  };

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const TOOLS = [
    {
      name: "Calculator + GST",
      desc: "Smart pricing with GST",
      icon: Calculator,
      iconColor: "#16A34A",
      bgColor: "#DCFCE7",
      route: "/tools/calculator" as const,
    },
    {
      name: "Unit Converter",
      desc: "g, oz, ml, cups",
      icon: ArrowLeftRight,
      iconColor: "#2563EB",
      bgColor: "#DBEAFE",
      route: "/tools/unit-converter" as const,
    },
    {
      name: "Multi Timer",
      desc: "Run 5 at once",
      icon: Clock,
      iconColor: "#D97706",
      bgColor: "#FEF3C7",
      route: "/tools/multi-timer" as const,
    },
    {
      name: "Yield Calculator",
      desc: "Whole to usable %",
      icon: Percent,
      iconColor: "#4F46E5",
      bgColor: "#E0E7FF",
      route: "/tools/yield-calculator" as const,
    },
  ];

  const lensSpin = lensRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bladeScale = shutterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.15],
  });

  const cameraOpacity = shutterAnim;

  const displayName = profile?.displayName;
  const greeting = getGreeting(displayName || undefined);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — greeting left, logo right */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {chefAvatar && (
              <Image
                source={{ uri: chefAvatar }}
                style={s.headerAvatar}
              />
            )}
            <Text style={[s.greeting, { color: colors.text }]}>
              {greeting}
            </Text>
          </View>
          <View style={s.headerLogo}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={s.headerLogoImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* SLR Camera Lens Bubble — HERO */}
        <View style={s.bubbleSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleBubblePress}
            style={s.bubbleOuter}
          >
            <Animated.View
              style={[
                s.glowRing,
                {
                  borderColor: "#16A34A",
                  transform: [{ scale: glowAnim }],
                },
              ]}
            />

            <Animated.View
              style={[
                s.lensBody,
                { transform: [{ scale: bubbleScale }] },
              ]}
            >
              <Animated.View
                style={[
                  s.gripRing,
                  { transform: [{ rotate: lensSpin }] },
                ]}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.gripMark,
                      {
                        transform: [
                          { rotate: `${i * 30}deg` },
                          { translateY: -90 },
                        ],
                      },
                    ]}
                  />
                ))}
              </Animated.View>

              <View style={s.apertureRing}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      s.blade,
                      {
                        transform: [
                          { rotate: `${i * 45}deg` },
                          { translateY: -40 },
                          { scaleY: bladeScale },
                        ],
                      },
                    ]}
                  />
                ))}

                <Animated.View style={[s.lensCenterIcon, { opacity: cameraOpacity }]}>
                  <Camera size={32} color="#16A34A" strokeWidth={1.5} />
                </Animated.View>
              </View>

              <View style={s.lensReflection} />
            </Animated.View>
          </TouchableOpacity>

          {!user && (
            <View style={s.lockOverlay}>
              <Lock size={14} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          )}

          <Text style={[s.bubbleTitle, { color: colors.text }]}>
            Anime Chef Studio
          </Text>
          <Text style={[s.bubbleSubtitle, { color: colors.textMuted }]}>
            {user ? "3 free · tap to create" : "Sign in to create your avatar"}
          </Text>

          <View style={s.stylePills}>
            {styles_list.map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => {
                  tap();
                  setSelectedStyle(st);
                }}
                style={[
                  s.stylePill,
                  {
                    backgroundColor:
                      selectedStyle === st ? colors.accent : colors.surface,
                    borderColor:
                      selectedStyle === st ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    s.stylePillText,
                    {
                      color: selectedStyle === st ? "#FFFFFF" : colors.textMuted,
                    },
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Choose Your Mode */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          Choose Your Mode
        </Text>
        {[
          {
            name: "Yes, Chef! Challenge",
            desc: "Split-screen: reality vs anime. Share the before and after",
            icon: Columns2,
            accent: "#EF4444",
          },
          {
            name: "Digital Kitchen Pass",
            desc: "Anime ID card with your title. Grill Superstar, Sauce Stallone, Pastry Picasso",
            icon: CreditCard,
            accent: "#7C3AED",
          },
          {
            name: "Manga Menu",
            desc: "Turn your whole brigade into an anime squad. Group photo to manga crew",
            icon: Users,
            accent: "#2563EB",
          },
        ].map((mode) => {
          const ModeIcon = mode.icon;
          return (
            <TouchableOpacity
              key={mode.name}
              onPress={() => {
                tap();
                router.push("/(tabs)/avatar");
              }}
              style={[
                s.modePill,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderLeftColor: mode.accent,
                  borderLeftWidth: 3,
                },
              ]}
            >
              <View style={[s.modePillIcon, { backgroundColor: mode.accent + "18" }]}>
                <ModeIcon size={17} color={mode.accent} strokeWidth={2} />
              </View>
              <View style={s.modePillText}>
                <Text style={[s.modePillName, { color: colors.text }]}>
                  {mode.name}
                </Text>
                <Text style={[s.modePillDesc, { color: colors.textMuted }]} numberOfLines={2}>
                  {mode.desc}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          );
        })}

        {/* Free Tools */}
        <Text style={[s.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Free Tools
        </Text>
        {TOOLS.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <TouchableOpacity
              key={tool.name}
              onPress={() => {
                tap();
                router.push(tool.route);
              }}
              style={[
                s.toolPill,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={[s.toolPillIcon, { backgroundColor: tool.bgColor }]}>
                <IconComponent size={17} color={tool.iconColor} strokeWidth={2} />
              </View>
              <View style={s.toolPillText}>
                <Text style={[s.toolPillName, { color: colors.text }]}>
                  {tool.name}
                </Text>
                <Text style={[s.toolPillDesc, { color: colors.textMuted }]}>
                  {tool.desc}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          );
        })}

        {/* Share + Earn */}
        {user && profile?.referralCode && (
          <>
            <Text style={[s.sectionTitle, { color: colors.text, marginTop: 20 }]}>
              Share + Earn
            </Text>
            <View
              style={[
                s.referralCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={[s.referralIconWrap, { backgroundColor: "#FEF3C7" }]}>
                <Users size={18} color="#D97706" strokeWidth={2} />
              </View>
              <View style={s.referralContent}>
                <Text style={[s.referralTitle, { color: colors.text }]}>
                  Your referral code
                </Text>
                <Text style={[s.referralCode, { color: colors.accent }]}>
                  {profile.referralCode}
                </Text>
                <Text style={[s.referralDesc, { color: colors.textMuted }]}>
                  Share your code — both get 5 free AI scans
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Coming Soon — 3 Products */}
        <Text style={[s.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Coming Soon
        </Text>
        <View
          style={[
            s.waitlistCard,
            { backgroundColor: colors.card, borderColor: colors.accent, borderWidth: 2 },
          ]}
        >
          <View style={s.productRow}>
            <Text style={[s.productName, { color: colors.text }]}>PrepSafe</Text>
            <Text style={[s.productDesc, { color: colors.textMuted }]}>
              Food safety compliance, made easy
            </Text>
          </View>

          <View style={[s.productRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[s.productName, { color: colors.text }]}>Prep Mi Student</Text>
            <Text style={[s.productDesc, { color: colors.textMuted }]}>
              Built for student chefs
            </Text>
          </View>

          <View style={[s.productRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[s.productName, { color: colors.text }]}>Prep Mi Pro</Text>
            <Text style={[s.productDesc, { color: colors.textMuted }]}>
              The full kitchen recipe costing, management & productivity app
            </Text>
          </View>

          <TextInput
            style={[
              s.waitlistInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={waitlistEmail2}
            onChangeText={setWaitlistEmail2}
          />
          <TouchableOpacity
            onPress={async () => {
              tap();
              if (!waitlistEmail2 || !waitlistEmail2.includes("@")) {
                Alert.alert("Invalid Email", "Please enter a valid email address.");
                return;
              }
              setWaitlistSubmitting2(true);
              try {
                await joinWaitlist(waitlistEmail2);
                setWaitlistJoined2(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (e: any) {
                Alert.alert("Oops", e.message || "Something went wrong.");
              } finally {
                setWaitlistSubmitting2(false);
              }
            }}
            disabled={waitlistSubmitting2 || waitlistJoined2}
            style={[
              s.waitlistBtn,
              {
                backgroundColor: waitlistJoined2 ? colors.success : colors.accent,
                opacity: waitlistSubmitting2 ? 0.6 : 1,
              },
            ]}
          >
            <Text style={s.waitlistBtnText}>
              {waitlistJoined2
                ? "You're on the list!"
                : waitlistSubmitting2
                ? "Joining..."
                : "Join the Waitlist"}
            </Text>
          </TouchableOpacity>
          <Text style={[s.waitlistCount, { color: colors.textMuted }]}>
            2,847 chefs already in line
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* CTA Popup — shown once after first avatar share */}
      <Modal
        visible={showCtaPopup}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCtaPopup(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.modalOverlay}
        >
          <View style={[s.modalSheet, { backgroundColor: colors.card }]}>
            <View style={s.modalHandle} />

            <TouchableOpacity
              onPress={() => setShowCtaPopup(false)}
              style={s.modalClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={s.modalBody}>
              <View style={s.modalLogo}>
                <Camera size={24} color="#FFFFFF" strokeWidth={1.75} />
              </View>
              <Text style={[s.modalTitle, { color: colors.text }]}>
                Ready to run your kitchen?
              </Text>

              <View style={s.modalProducts}>
                <View style={[s.modalProductCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.modalProductName, { color: colors.text }]}>PrepSafe</Text>
                  <Text style={[s.modalProductDesc, { color: colors.textMuted }]}>
                    Food safety compliance, made easy
                  </Text>
                </View>
                <View style={[s.modalProductCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.modalProductName, { color: colors.text }]}>Prep Mi Student</Text>
                  <Text style={[s.modalProductDesc, { color: colors.textMuted }]}>
                    Built for student chefs
                  </Text>
                </View>
                <View style={[s.modalProductCard, { backgroundColor: colors.surface, borderColor: "#16A34A", borderWidth: 2 }]}>
                  <Text style={[s.modalProductName, { color: colors.text }]}>Prep Mi Pro</Text>
                  <Text style={[s.modalProductDesc, { color: colors.textMuted }]}>
                    The full kitchen recipe costing, management & productivity app
                  </Text>
                </View>
              </View>

              <TextInput
                style={[
                  s.waitlistInput,
                  {
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    borderColor: colors.border,
                    marginTop: 12,
                  },
                ]}
                placeholder="your@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={ctaEmail}
                onChangeText={setCtaEmail}
              />
              <TouchableOpacity
                onPress={async () => {
                  tap();
                  if (!ctaEmail || !ctaEmail.includes("@")) {
                    Alert.alert("Invalid Email", "Please enter a valid email.");
                    return;
                  }
                  setCtaSubmitting(true);
                  try {
                    await joinWaitlist(ctaEmail);
                    setCtaJoined(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setTimeout(() => setShowCtaPopup(false), 1500);
                  } catch (e: any) {
                    Alert.alert("Oops", e.message || "Something went wrong.");
                  } finally {
                    setCtaSubmitting(false);
                  }
                }}
                disabled={ctaSubmitting || ctaJoined}
                style={[
                  s.waitlistBtn,
                  {
                    backgroundColor: ctaJoined ? colors.success : colors.accent,
                    opacity: ctaSubmitting ? 0.6 : 1,
                    marginTop: 10,
                  },
                ]}
              >
                <Text style={s.waitlistBtnText}>
                  {ctaJoined ? "You're on the list!" : ctaSubmitting ? "Joining..." : "Join the Waitlist"}
                </Text>
              </TouchableOpacity>

              <Text style={[s.modalFootnote, { color: colors.textMuted }]}>
                Not now? Find this at the bottom of the home page.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 },
  scrollContent: { paddingHorizontal: 16 },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  greeting: { fontSize: 20, fontWeight: "800", flexShrink: 1 },
  headerLogo: {
    width: 68,
    height: 68,
    borderRadius: 16,
    overflow: "hidden",
  },
  headerLogoImage: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  // SLR Lens Bubble
  bubbleSection: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  bubbleOuter: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
  },
  lensBody: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#1A1A1A",
    borderWidth: 3,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  gripRing: {
    position: "absolute",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  gripMark: {
    position: "absolute",
    width: 3,
    height: 10,
    backgroundColor: "#555",
    borderRadius: 1.5,
  },
  apertureRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#0D0D0D",
    borderWidth: 2,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blade: {
    position: "absolute",
    width: 56,
    height: 56,
    backgroundColor: "#222",
    borderWidth: 0.5,
    borderColor: "#3A3A3A",
  },
  lensCenterIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  lensReflection: {
    position: "absolute",
    top: 18,
    left: 40,
    width: 50,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "-30deg" }],
  },
  lockOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FAFAF8",
    zIndex: 5,
  },
  bubbleTitle: { fontSize: 16, fontWeight: "700", marginTop: 16 },
  bubbleSubtitle: { fontSize: 12, marginTop: 4 },
  stylePills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  stylePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  stylePillText: { fontSize: 12, fontWeight: "600" },
  // Section
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  // Tools
  toolPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  toolPillIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  toolPillText: { flex: 1, marginLeft: 12 },
  toolPillName: { fontSize: 13, fontWeight: "700" },
  toolPillDesc: { fontSize: 11, marginTop: 1 },
  // Mode pills
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  modePillIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  modePillText: { flex: 1, marginLeft: 12, marginRight: 8 },
  modePillName: { fontSize: 13, fontWeight: "700" },
  modePillDesc: { fontSize: 11, marginTop: 1, lineHeight: 15 },
  // Referral
  referralCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  referralIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  referralContent: { flex: 1, marginLeft: 12 },
  referralTitle: { fontSize: 13, fontWeight: "600" },
  referralCode: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  referralDesc: { fontSize: 11, marginTop: 2 },
  // Products
  productRow: { paddingVertical: 12 },
  productName: { fontSize: 15, fontWeight: "700" },
  productDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "88%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  modalClose: { position: "absolute", top: 14, right: 16, zIndex: 10 },
  modalBody: { alignItems: "center", paddingTop: 4 },
  modalLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  modalProducts: { width: "100%", gap: 8, marginTop: 16 },
  modalProductCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  modalProductName: { fontSize: 14, fontWeight: "700" },
  modalProductDesc: { fontSize: 12, marginTop: 2 },
  modalFootnote: { fontSize: 11, marginTop: 12, textAlign: "center" },
  // Waitlist
  waitlistCard: {
    borderRadius: 14,
    padding: 20,
  },
  waitlistInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    marginTop: 16,
  },
  waitlistBtn: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 12,
  },
  waitlistBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  waitlistCount: { textAlign: "center", fontSize: 11, marginTop: 10 },
});
