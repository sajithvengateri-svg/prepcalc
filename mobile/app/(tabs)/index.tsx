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
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Settings,
  Camera,
  ArrowUpDown,
  ArrowLeftRight,
  Clock,
  DollarSign,
  Percent,
  Check,
  Share2,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { joinWaitlist } from "../../src/lib/waitlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ClockMode = "clock" | "timer" | "stopwatch";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  // Clock state
  const [clockMode, setClockMode] = useState<ClockMode>("clock");
  const [currentTime, setCurrentTime] = useState(new Date());
  // Timer state
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  // Stopwatch state
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [swLaps, setSwLaps] = useState<number[]>([]);

  // Animations
  const glowAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const cameraFadeAnim = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

  // Waitlist email
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  // Style pills
  const [selectedStyle, setSelectedStyle] = useState("Anime");
  const styles_list = ["Anime", "Ghibli", "Pixel", "Comic"];

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerRunning || timerRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Stopwatch
  useEffect(() => {
    if (!swRunning) return;
    const interval = setInterval(() => {
      setSwElapsed((prev) => prev + 10);
    }, 10);
    return () => clearInterval(interval);
  }, [swRunning]);

  // Animations
  useEffect(() => {
    // Glow pulse
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

    // Shutter rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();

    // Camera icon fade
    Animated.loop(
      Animated.sequence([
        Animated.timing(cameraFadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(cameraFadeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    ).start();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimerDisplay = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatSwDisplay = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
    if (total > 0) {
      setTimerRemaining(total);
      setTimerRunning(true);
    }
  };

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
      name: "Recipe Scaler",
      desc: "Scale any recipe",
      icon: ArrowUpDown,
      iconColor: "#16A34A",
      bgColor: "#DCFCE7",
      route: "/tools/recipe-scaler" as const,
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
      name: "Cost / Portion",
      desc: "Know your margins",
      icon: DollarSign,
      iconColor: "#DB2777",
      bgColor: "#FCE7F3",
      route: "/tools/cost-portion" as const,
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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.logoWrap}>
              <View style={[s.logoPlaceholder, { backgroundColor: "#16A34A" }]}>
                <Text style={s.logoText}>P</Text>
              </View>
            </View>
            <Text style={[s.headerTitle, { color: colors.text }]}>
              Prep<Text style={{ color: "#16A34A" }}>Calc</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Settings size={22} color={colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Clock / Timer / Stopwatch */}
        <View style={[s.clockCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Mode pills */}
          <View style={s.clockPills}>
            {(["clock", "timer", "stopwatch"] as ClockMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => {
                  tap();
                  setClockMode(mode);
                }}
                style={[
                  s.clockPill,
                  {
                    backgroundColor:
                      clockMode === mode ? colors.accent : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    s.clockPillText,
                    {
                      color: clockMode === mode ? "#FFFFFF" : colors.textMuted,
                    },
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {clockMode === "clock" && (
            <View style={s.clockDisplay}>
              <Text style={[s.clockTime, { color: colors.text }]}>
                {formatTime(currentTime)}
              </Text>
              <Text style={[s.clockDate, { color: colors.textMuted }]}>
                {formatDate(currentTime)}
              </Text>
            </View>
          )}

          {clockMode === "timer" && (
            <View style={s.clockDisplay}>
              {!timerRunning && timerRemaining === 0 ? (
                <>
                  <View style={s.timerInputRow}>
                    <View style={s.timerInputGroup}>
                      <TextInput
                        style={[s.timerInput, { color: colors.text, borderColor: colors.border }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="00"
                        placeholderTextColor={colors.textMuted}
                        value={timerHours ? String(timerHours) : ""}
                        onChangeText={(t) => setTimerHours(parseInt(t) || 0)}
                      />
                      <Text style={[s.timerLabel, { color: colors.textMuted }]}>hr</Text>
                    </View>
                    <Text style={[s.timerColon, { color: colors.text }]}>:</Text>
                    <View style={s.timerInputGroup}>
                      <TextInput
                        style={[s.timerInput, { color: colors.text, borderColor: colors.border }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="00"
                        placeholderTextColor={colors.textMuted}
                        value={timerMinutes ? String(timerMinutes) : ""}
                        onChangeText={(t) => setTimerMinutes(parseInt(t) || 0)}
                      />
                      <Text style={[s.timerLabel, { color: colors.textMuted }]}>min</Text>
                    </View>
                    <Text style={[s.timerColon, { color: colors.text }]}>:</Text>
                    <View style={s.timerInputGroup}>
                      <TextInput
                        style={[s.timerInput, { color: colors.text, borderColor: colors.border }]}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="00"
                        placeholderTextColor={colors.textMuted}
                        value={timerSeconds ? String(timerSeconds) : ""}
                        onChangeText={(t) => setTimerSeconds(parseInt(t) || 0)}
                      />
                      <Text style={[s.timerLabel, { color: colors.textMuted }]}>sec</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => { tap(); startTimer(); }}
                    style={[s.timerBtn, { backgroundColor: colors.accent }]}
                  >
                    <Play size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={s.timerBtnText}>Start</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[s.clockTime, { color: timerRemaining === 0 ? colors.success : colors.text }]}>
                    {formatTimerDisplay(timerRemaining)}
                  </Text>
                  {timerRemaining === 0 && (
                    <Text style={[s.timerDoneText, { color: colors.success }]}>
                      Timer Complete
                    </Text>
                  )}
                  <View style={s.timerControls}>
                    <TouchableOpacity
                      onPress={() => { tap(); setTimerRunning(!timerRunning); }}
                      style={[s.timerBtn, { backgroundColor: timerRunning ? colors.warning : colors.accent }]}
                    >
                      {timerRunning ? (
                        <Pause size={16} color="#FFFFFF" strokeWidth={2} />
                      ) : (
                        <Play size={16} color="#FFFFFF" strokeWidth={2} />
                      )}
                      <Text style={s.timerBtnText}>{timerRunning ? "Pause" : "Resume"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        tap();
                        setTimerRunning(false);
                        setTimerRemaining(0);
                      }}
                      style={[s.timerBtn, { backgroundColor: colors.destructive }]}
                    >
                      <RotateCcw size={16} color="#FFFFFF" strokeWidth={2} />
                      <Text style={s.timerBtnText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}

          {clockMode === "stopwatch" && (
            <View style={s.clockDisplay}>
              <Text style={[s.clockTime, { color: colors.text }]}>
                {formatSwDisplay(swElapsed)}
              </Text>
              <View style={s.timerControls}>
                <TouchableOpacity
                  onPress={() => { tap(); setSwRunning(!swRunning); }}
                  style={[s.timerBtn, { backgroundColor: swRunning ? colors.warning : colors.accent }]}
                >
                  {swRunning ? (
                    <Pause size={16} color="#FFFFFF" strokeWidth={2} />
                  ) : (
                    <Play size={16} color="#FFFFFF" strokeWidth={2} />
                  )}
                  <Text style={s.timerBtnText}>{swRunning ? "Stop" : "Start"}</Text>
                </TouchableOpacity>
                {swRunning && (
                  <TouchableOpacity
                    onPress={() => { tap(); setSwLaps((prev) => [swElapsed, ...prev]); }}
                    style={[s.timerBtn, { backgroundColor: colors.accent }]}
                  >
                    <Text style={s.timerBtnText}>Lap</Text>
                  </TouchableOpacity>
                )}
                {!swRunning && swElapsed > 0 && (
                  <TouchableOpacity
                    onPress={() => { tap(); setSwElapsed(0); setSwLaps([]); }}
                    style={[s.timerBtn, { backgroundColor: colors.destructive }]}
                  >
                    <RotateCcw size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={s.timerBtnText}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>
              {swLaps.length > 0 && (
                <View style={s.lapList}>
                  {swLaps.map((lap, i) => (
                    <View
                      key={i}
                      style={[s.lapRow, { borderBottomColor: colors.border }]}
                    >
                      <Text style={[s.lapLabel, { color: colors.textMuted }]}>
                        Lap {swLaps.length - i}
                      </Text>
                      <Text style={[s.lapTime, { color: colors.text }]}>
                        {formatSwDisplay(lap)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Camera Bubble */}
        <View style={s.bubbleSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleBubblePress}
            style={s.bubbleOuter}
          >
            {/* Shutter ring */}
            <Animated.View
              style={[
                s.shutterRing,
                { transform: [{ rotate: spin }] },
              ]}
            >
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <View
                  key={deg}
                  style={[
                    s.shutterBlade,
                    {
                      transform: [{ rotate: `${deg}deg` }],
                    },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Glow ring */}
            <Animated.View
              style={[
                s.glowRing,
                {
                  borderColor: "#16A34A",
                  transform: [{ scale: glowAnim }],
                },
              ]}
            />

            {/* Green circle */}
            <Animated.View
              style={[
                s.greenCircle,
                { transform: [{ scale: bubbleScale }] },
              ]}
            >
              {/* Logo placeholder */}
              <View style={s.bubbleLogoWrap}>
                <Text style={s.bubbleLogo}>P</Text>
              </View>

              {/* Camera overlay */}
              <Animated.View
                style={[s.cameraOverlay, { opacity: cameraFadeAnim }]}
              >
                <Camera size={36} color="#FFFFFF" strokeWidth={1.5} />
                <Text style={s.cameraScanText}>AI SCAN</Text>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>

          <Text style={[s.bubbleTitle, { color: colors.text }]}>
            Anime Chef Studio
          </Text>
          <Text style={[s.bubbleSubtitle, { color: colors.textMuted }]}>
            Selfie to 15s animated anime video
          </Text>
          <View style={[s.bubbleBadge, { backgroundColor: "#DCFCE7" }]}>
            <Text style={s.bubbleBadgeText}>
              Preview free  ·  $1 to share
            </Text>
          </View>

          {/* Style pills */}
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

        {/* Quick Tools Grid */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>
          Quick Tools
        </Text>
        <View style={s.toolGrid}>
          {TOOLS.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <TouchableOpacity
                key={tool.name}
                onPress={() => {
                  tap();
                  router.push(tool.route);
                }}
                style={[
                  s.toolCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    width: index < 4 ? (SCREEN_WIDTH - 48) / 2 : SCREEN_WIDTH - 32,
                  },
                ]}
              >
                <View
                  style={[
                    s.toolIconWrap,
                    { backgroundColor: tool.bgColor },
                  ]}
                >
                  <IconComponent
                    size={22}
                    color={tool.iconColor}
                    strokeWidth={2}
                  />
                </View>
                <Text style={[s.toolName, { color: colors.text }]}>
                  {tool.name}
                </Text>
                <Text style={[s.toolDesc, { color: colors.textMuted }]}>
                  {tool.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Referral Card */}
        <View
          style={[
            s.referralCard,
            { backgroundColor: "#FFFBF0", borderColor: "#F3E8D0" },
          ]}
        >
          <Text style={[s.referralTitle, { color: "#1A1A1A" }]}>
            Share PrepCalc, Earn Credits
          </Text>
          <Text style={[s.referralDesc, { color: "#6B7280" }]}>
            Every friend who downloads — you both get 5 free AI scans + priority
            Pro access
          </Text>
          <View style={[s.referralCodeBox, { borderColor: "#D97706" }]}>
            <Text style={[s.referralCode, { color: "#D97706" }]}>
              CHEF-2026
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => tap()}
            style={[s.referralBtn, { backgroundColor: "#D97706" }]}
          >
            <Share2 size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={s.referralBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Waitlist CTA */}
        <View
          style={[
            s.waitlistCard,
            { backgroundColor: colors.card, borderColor: colors.accent, borderWidth: 2 },
          ]}
        >
          <View style={[s.comingSoonBadge, { backgroundColor: colors.accentBg }]}>
            <Text style={[s.comingSoonText, { color: colors.accent }]}>
              Coming Soon
            </Text>
          </View>
          <Text style={[s.waitlistTitle, { color: colors.text }]}>
            Prep Mi Pro
          </Text>
          <Text style={[s.waitlistDesc, { color: colors.textMuted }]}>
            The complete kitchen management platform for professionals
          </Text>

          <View style={s.perksList}>
            {[
              "Priority access at launch",
              "50% off AI credits first month",
              "Anime avatar buyers skip the queue",
              "Free PrepSafe tier included",
            ].map((perk) => (
              <View key={perk} style={s.perkRow}>
                <Check size={16} color={colors.accent} strokeWidth={2.5} />
                <Text style={[s.perkText, { color: colors.text }]}>
                  {perk}
                </Text>
              </View>
            ))}
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
            value={waitlistEmail}
            onChangeText={setWaitlistEmail}
          />
          <TouchableOpacity
            onPress={async () => {
              tap();
              if (!waitlistEmail || !waitlistEmail.includes("@")) {
                Alert.alert("Invalid Email", "Please enter a valid email address.");
                return;
              }
              setWaitlistSubmitting(true);
              try {
                await joinWaitlist(waitlistEmail);
                setWaitlistJoined(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (e: any) {
                Alert.alert("Oops", e.message || "Something went wrong.");
              } finally {
                setWaitlistSubmitting(false);
              }
            }}
            disabled={waitlistSubmitting || waitlistJoined}
            style={[
              s.waitlistBtn,
              {
                backgroundColor: waitlistJoined ? colors.success : colors.accent,
                opacity: waitlistSubmitting ? 0.6 : 1,
              },
            ]}
          >
            <Text style={s.waitlistBtnText}>
              {waitlistJoined
                ? "You're on the list!"
                : waitlistSubmitting
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
  },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  // Clock
  clockCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  clockPills: { flexDirection: "row", gap: 8, marginBottom: 16 },
  clockPill: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  clockPillText: { fontSize: 13, fontWeight: "600" },
  clockDisplay: { alignItems: "center" },
  clockTime: { fontSize: 48, fontWeight: "300", letterSpacing: -1 },
  clockDate: { fontSize: 13, marginTop: 4 },
  // Timer
  timerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  timerInputGroup: { alignItems: "center" },
  timerInput: {
    width: 60,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
  },
  timerLabel: { fontSize: 11, marginTop: 4 },
  timerColon: { fontSize: 24, fontWeight: "300", marginBottom: 16 },
  timerControls: { flexDirection: "row", gap: 10, marginTop: 12 },
  timerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  timerBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  timerDoneText: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  // Laps
  lapList: { width: "100%", marginTop: 12 },
  lapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  lapLabel: { fontSize: 13 },
  lapTime: { fontSize: 13, fontWeight: "600" },
  // Bubble
  bubbleSection: { alignItems: "center", marginBottom: 24 },
  bubbleOuter: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterRing: {
    position: "absolute",
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBlade: {
    position: "absolute",
    width: 2,
    height: 160,
    backgroundColor: "rgba(22,163,74,0.15)",
  },
  glowRing: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 2,
  },
  greenCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(22,163,74,0.35)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  bubbleLogoWrap: { alignItems: "center", justifyContent: "center" },
  bubbleLogo: { color: "#FFFFFF", fontSize: 48, fontWeight: "800" },
  cameraOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraScanText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },
  bubbleTitle: { fontSize: 16, fontWeight: "700", marginTop: 16 },
  bubbleSubtitle: { fontSize: 12, marginTop: 4 },
  bubbleBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 10,
  },
  bubbleBadgeText: { color: "#16A34A", fontSize: 12, fontWeight: "600" },
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
  // Tools
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  toolCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  toolName: { fontSize: 13, fontWeight: "700" },
  toolDesc: { fontSize: 11, marginTop: 2 },
  // Referral
  referralCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  referralTitle: { fontSize: 14, fontWeight: "700" },
  referralDesc: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  referralCodeBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  referralCode: { fontSize: 18, fontWeight: "800", letterSpacing: 2 },
  referralBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  referralBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  // Waitlist
  waitlistCard: {
    borderRadius: 14,
    padding: 20,
  },
  comingSoonBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  comingSoonText: { fontSize: 12, fontWeight: "600" },
  waitlistTitle: { fontSize: 18, fontWeight: "800" },
  waitlistDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  perksList: { marginTop: 16, gap: 10 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  perkText: { fontSize: 13, flex: 1 },
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
