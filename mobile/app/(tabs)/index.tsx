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
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Settings,
  Camera,
  Calculator,
  ArrowLeftRight,
  Clock,
  Percent,
  Check,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Columns2,
  CreditCard,
  Users,
  Shield,
  Lock,
  X,
} from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { useAuth } from "../../src/contexts/AuthProvider";
import { joinWaitlist } from "../../src/lib/waitlist";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ClockMode = "clock" | "timer" | "stopwatch";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
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
  const bubbleScale = useRef(new Animated.Value(1)).current;
  // SLR shutter: 0 = closed, 1 = open
  const shutterAnim = useRef(new Animated.Value(0)).current;
  // Lens ring slow rotation
  const lensRotate = useRef(new Animated.Value(0)).current;

  // Waitlist email
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);

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

    // Slow lens rotation (20s)
    Animated.loop(
      Animated.timing(lensRotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Shutter open/close loop
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
      name: "ChefCalc Pro",
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

  // Shutter blade scale: closed=1 (full blade), open=0.15 (retracted)
  const bladeScale = shutterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.15],
  });

  // Camera icon appears when shutter opens
  const cameraOpacity = shutterAnim;

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
              <Image
                source={require("../../assets/images/logo.png")}
                style={s.logoImage}
                resizeMode="cover"
              />
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

        {/* SLR Camera Lens Bubble */}
        <View style={s.bubbleSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleBubblePress}
            style={s.bubbleOuter}
          >
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

            {/* Lens body */}
            <Animated.View
              style={[
                s.lensBody,
                { transform: [{ scale: bubbleScale }] },
              ]}
            >
              {/* Rotating grip marks */}
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

              {/* Aperture ring */}
              <View style={s.apertureRing}>
                {/* 8 shutter blades */}
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

                {/* Camera icon in centre — visible when shutter opens */}
                <Animated.View style={[s.lensCenterIcon, { opacity: cameraOpacity }]}>
                  <Camera size={32} color="#16A34A" strokeWidth={1.5} />
                </Animated.View>
              </View>

              {/* Lens reflection highlight */}
              <View style={s.lensReflection} />
            </Animated.View>
          </TouchableOpacity>

          {/* Lock overlay when not signed in */}
          {!user && (
            <View style={s.lockOverlay}>
              <Lock size={14} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          )}

          <Text style={[s.bubbleTitle, { color: colors.text }]}>
            Anime Chef Studio
          </Text>
          <Text style={[s.bubbleSubtitle, { color: colors.textMuted }]}>
            {user ? "Selfie to 15s animated anime video" : "Sign in to create your avatar"}
          </Text>
          <View style={[s.bubbleBadge, { backgroundColor: "#DCFCE7" }]}>
            <Text style={s.bubbleBadgeText}>
              3 free · more from $0.99
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
            desc: "Anime ID card with your title. Grill Superstar, Sauce Stallone, Pastry Picasso. Share to unlock Verified Chef",
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

        {/* Quick Tools */}
        <Text style={[s.sectionTitle, { color: colors.text, marginTop: 20 }]}>
          Quick Tools
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

        {/* Waitlist Card — Prep Mi Student + Pro */}
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
            Prep Mi Student + Pro
          </Text>

          <View style={s.perksList}>
            {[
              "Priority access at launch",
              "50% off AI credits first month",
              "Avatar buyers skip the queue",
              "Free food safety tools included",
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
            {/* Handle bar */}
            <View style={s.modalHandle} />

            {/* Close */}
            <TouchableOpacity
              onPress={() => setShowCtaPopup(false)}
              style={s.modalClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={s.modalBody}>
              <Shield size={32} color={colors.accent} strokeWidth={1.5} />
              <Text style={[s.modalTitle, { color: colors.text }]}>
                Loved making that? <Text style={{ color: "#16A34A" }}>There's more.</Text>
              </Text>
              <Text style={[s.modalSubtitle, { color: colors.textMuted }]}>
                Prep Mi is building the full kitchen OS for students and professionals
              </Text>

              {/* Tier cards side by side */}
              <View style={s.tierRow}>
                {/* Student */}
                <View style={[s.tierCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.tierName, { color: colors.text }]}>Student</Text>
                  <View style={s.tierPerks}>
                    {["Recipe portfolio", "Training tracker", "Food safety basics", "25 AI scans/day"].map((p) => (
                      <View key={p} style={s.tierPerkRow}>
                        <Check size={12} color={colors.accent} strokeWidth={2.5} />
                        <Text style={[s.tierPerkText, { color: colors.textMuted }]}>{p}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[s.tierPrice, { color: colors.textMuted }]}>Coming soon</Text>
                </View>
                {/* Pro */}
                <View style={[s.tierCard, { backgroundColor: colors.surface, borderColor: "#16A34A", borderWidth: 2 }]}>
                  <Text style={[s.tierName, { color: colors.text }]}>Pro</Text>
                  <View style={s.tierPerks}>
                    {["Everything in Student", "Live recipe costing", "Menu engineering", "50 AI scans/day"].map((p) => (
                      <View key={p} style={s.tierPerkRow}>
                        <Check size={12} color={colors.accent} strokeWidth={2.5} />
                        <Text style={[s.tierPerkText, { color: colors.textMuted }]}>{p}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[s.tierPrice, { color: colors.textMuted }]}>Coming soon</Text>
                </View>
              </View>

              <Text style={[s.modalHighlight, { color: "#16A34A" }]}>
                Avatar buyers get priority + 50% off first month
              </Text>

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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
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
  // SLR Lens Bubble
  bubbleSection: { alignItems: "center", marginBottom: 24 },
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
  // Tools (vertical pills)
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
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
  modalTitle: { fontSize: 18, fontWeight: "800", textAlign: "center", marginTop: 12 },
  modalSubtitle: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18, paddingHorizontal: 10 },
  tierRow: { flexDirection: "row", gap: 10, marginTop: 16, width: "100%" },
  tierCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  tierName: { fontSize: 14, fontWeight: "800", marginBottom: 8 },
  tierPerks: { gap: 5 },
  tierPerkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tierPerkText: { fontSize: 10, flex: 1 },
  tierPrice: { fontSize: 11, fontWeight: "600", marginTop: 10, textAlign: "center" },
  modalHighlight: { fontSize: 12, fontWeight: "700", marginTop: 14, textAlign: "center" },
  modalFootnote: { fontSize: 11, marginTop: 12, textAlign: "center" },
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
