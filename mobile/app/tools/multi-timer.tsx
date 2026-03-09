import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  StyleSheet,
  Alert,
  Animated,
  Modal,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Play,
  Pause,
  RotateCcw,
  X,
  Volume2,
} from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { useTimerVoice } from "../../src/hooks/useTimerVoice";

const CHEF_AVATAR_KEY = "chef_avatar_url";

// ─── Constants ───
const RING_SIZE = 80;
const RING_STROKE = 5;
const PICKER_ITEM_H = 40;

const QUICK_NAMES = [
  "Pasta",
  "Rice",
  "Stock",
  "Sauce",
  "Oven",
  "Rest",
  "Proof",
  "Blanch",
];

// ─── Types ───
interface TimerData {
  id: string;
  name: string;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  remainingSeconds: number;
  status: "idle" | "running" | "paused" | "done";
}

// ─── Helpers ───
function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function getRingColor(t: TimerData): string {
  if (t.status === "done") return "#DC2626";
  if (t.totalSeconds === 0 || t.status === "idle") return "#16A34A";
  const pct = t.remainingSeconds / t.totalSeconds;
  if (pct > 0.5) return "#16A34A";
  if (pct > 0.1) return "#D97706";
  return "#DC2626";
}

// ─── Scroll Wheel Picker Column ───
function WheelColumn({
  count,
  value,
  onChange,
  textColor,
  borderColor,
}: {
  count: number;
  value: number;
  onChange: (v: number) => void;
  textColor: string;
  borderColor: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const items = Array.from({ length: count }, (_, i) => i);
  const mounted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: value * PICKER_ITEM_H,
        animated: false,
      });
      mounted.current = true;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleEnd = (y: number) => {
    if (!mounted.current) return;
    const idx = Math.round(y / PICKER_ITEM_H);
    const clamped = Math.max(0, Math.min(idx, count - 1));
    if (clamped !== value) {
      Haptics.selectionAsync();
      onChange(clamped);
    }
  };

  return (
    <View style={{ height: PICKER_ITEM_H * 3, width: 54, overflow: "hidden" }}>
      {/* Selection highlight lines */}
      <View
        style={{
          position: "absolute",
          top: PICKER_ITEM_H,
          left: 4,
          right: 4,
          height: PICKER_ITEM_H,
          borderTopWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: borderColor + "50",
          borderRadius: 4,
          zIndex: 1,
        }}
        pointerEvents="none"
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={PICKER_ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PICKER_ITEM_H }}
        onMomentumScrollEnd={(e) => handleEnd(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => handleEnd(e.nativeEvent.contentOffset.y)}
      >
        {items.map((num) => (
          <View
            key={num}
            style={{
              height: PICKER_ITEM_H,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
                color: textColor,
                opacity: num === value ? 1 : 0.35,
              }}
            >
              {num.toString().padStart(2, "0")}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Main Component ───
export default function MultiTimerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { speak } = useTimerVoice();

  const [timers, setTimers] = useState<TimerData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>(
    {}
  );

  // Completion modal state
  const [doneModal, setDoneModal] = useState<{ name: string } | null>(null);
  const [chefAvatar, setChefAvatar] = useState<string | null>(null);
  const modalBounce = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load chef avatar
  useEffect(() => {
    AsyncStorage.getItem(CHEF_AVATAR_KEY).then((url) => {
      if (url) setChefAvatar(url);
    });
  }, []);

  // Request notification permissions on mount
  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  const showDoneModal = (timerName: string) => {
    setDoneModal({ name: timerName });
    modalOpacity.setValue(0);
    modalBounce.setValue(0);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(modalBounce, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => {
      dismissDoneModal();
    }, 4000);
  };

  const dismissDoneModal = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setDoneModal(null));
  };

  const notifIdsRef = useRef<Record<string, string>>({});

  // Pulse animation for < 30s warning
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Flash animation for done timers
  const doneFlash = useRef(new Animated.Value(0)).current;

  const anyUnder30 = timers.some(
    (t) => t.status === "running" && t.remainingSeconds > 0 && t.remainingSeconds <= 30
  );
  const anyDone = timers.some((t) => t.status === "done");
  const isCompact = timers.length >= 3;

  // Pulse animation when any timer < 30s
  useEffect(() => {
    if (!anyUnder30) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anyUnder30]);

  // Done card flash
  useEffect(() => {
    if (!anyDone) {
      doneFlash.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(doneFlash, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(doneFlash, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anyDone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // ─── Timer Actions ───
  const addTimer = () => {
    if (timers.length >= 5) {
      Alert.alert("Limit reached", "You can run up to 5 timers at once.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTimer: TimerData = {
      id: Date.now().toString(),
      name: `Timer ${timers.length + 1}`,
      hours: 0,
      minutes: 5,
      seconds: 0,
      totalSeconds: 0,
      remainingSeconds: 0,
      status: "idle",
    };
    setTimers((prev) => [...prev, newTimer]);
    setExpandedId(newTimer.id);
  };

  const removeTimer = (id: string) => {
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }
    if (notifIdsRef.current[id]) {
      Notifications.cancelScheduledNotificationAsync(notifIdsRef.current[id]).catch(() => {});
      delete notifIdsRef.current[id];
    }
    setTimers((prev) => prev.filter((t) => t.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const setTimerField = (
    id: string,
    field: "name" | "hours" | "minutes" | "seconds",
    value: string | number
  ) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const startTimer = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let timerName = "";
    let timerSeconds = 0;

    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        let total = t.totalSeconds;
        let remaining = t.remainingSeconds;
        if (t.status === "idle" || t.status === "done") {
          total = t.hours * 3600 + t.minutes * 60 + t.seconds;
          remaining = total;
        }
        if (remaining <= 0) return t;
        timerName = t.name;
        timerSeconds = remaining;
        return {
          ...t,
          totalSeconds: total,
          remainingSeconds: remaining,
          status: "running",
        };
      })
    );

    // Schedule background notification
    if (timerSeconds > 0) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: `${timerName} — Done!`,
          body: "Your timer has finished, Chef!",
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: timerSeconds },
      }).then((notifId) => {
        // Store notification ID for cancellation
        notifIdsRef.current[id] = notifId;
      }).catch(() => {});
    }

    if (intervalsRef.current[id]) clearInterval(intervalsRef.current[id]);
    intervalsRef.current[id] = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.id !== id || t.status !== "running") return t;
          const next = t.remainingSeconds - 1;
          if (next <= 0) {
            clearInterval(intervalsRef.current[id]);
            delete intervalsRef.current[id];
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // Cancel the scheduled notification (we're in foreground)
            if (notifIdsRef.current[id]) {
              Notifications.cancelScheduledNotificationAsync(notifIdsRef.current[id]).catch(() => {});
              delete notifIdsRef.current[id];
            }
            // Voice alert + completion modal
            speak(t.name);
            showDoneModal(t.name);
            return { ...t, remainingSeconds: 0, status: "done" };
          }
          return { ...t, remainingSeconds: next };
        })
      );
    }, 1000);
  };

  const pauseTimer = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }
    if (notifIdsRef.current[id]) {
      Notifications.cancelScheduledNotificationAsync(notifIdsRef.current[id]).catch(() => {});
      delete notifIdsRef.current[id];
    }
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "paused" } : t))
    );
  };

  const resetTimer = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }
    if (notifIdsRef.current[id]) {
      Notifications.cancelScheduledNotificationAsync(notifIdsRef.current[id]).catch(() => {});
      delete notifIdsRef.current[id];
    }
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, remainingSeconds: 0, totalSeconds: 0, status: "idle" }
          : t
      )
    );
  };

  // ─── Timer Ring ───
  const renderRing = (t: TimerData, size: number = RING_SIZE) => {
    const stroke = size >= 60 ? RING_STROKE : 3.5;
    const radius = (size - stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const color = getRingColor(t);

    let offset = 0;
    if (t.totalSeconds > 0 && t.status !== "idle") {
      offset = circumference * ((t.totalSeconds - t.remainingSeconds) / t.totalSeconds);
    }
    if (t.status === "done") offset = circumference;

    const shouldPulse =
      t.status === "running" && t.remainingSeconds > 0 && t.remainingSeconds <= 30;

    const timeText =
      t.status === "idle"
        ? formatTime(t.hours * 3600 + t.minutes * 60 + t.seconds)
        : formatTime(t.remainingSeconds);

    const ring = (
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
          {/* Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress ring */}
          {(t.totalSeconds > 0 || t.status === "done") && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          )}
        </Svg>
        {/* Centre label */}
        <View
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {t.status === "done" ? (
            <Text
              style={{
                fontSize: size >= 60 ? 14 : 9,
                fontWeight: "800",
                color: "#DC2626",
                letterSpacing: 1,
              }}
            >
              DONE
            </Text>
          ) : (
            <Text
              style={{
                fontSize: size >= 60 ? 14 : 10,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
                color: colors.text,
              }}
            >
              {timeText}
            </Text>
          )}
        </View>
      </View>
    );

    if (shouldPulse) {
      return <Animated.View style={{ opacity: pulseAnim }}>{ring}</Animated.View>;
    }
    return ring;
  };

  // ─── Compact Row ───
  const renderCompactRow = (t: TimerData) => {
    const isDone = t.status === "done";
    return (
      <TouchableOpacity
        key={t.id}
        onPress={() => setExpandedId(expandedId === t.id ? null : t.id)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            st.compactRow,
            {
              backgroundColor: isDone
                ? (doneFlash.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.card, "#FEE2E2"],
                  }) as any)
                : colors.card,
              borderColor: isDone ? "#DC2626" : colors.cardBorder,
            },
          ]}
        >
          {renderRing(t, 44)}
          <Text
            style={[st.compactName, { color: isDone ? "#DC2626" : colors.text }]}
            numberOfLines={1}
          >
            {t.name}
          </Text>
          {/* Compact controls */}
          {t.status === "running" ? (
            <TouchableOpacity
              onPress={() => pauseTimer(t.id)}
              style={[st.compactCtrl, { backgroundColor: "#FEF3C7" }]}
            >
              <Pause size={14} color="#D97706" strokeWidth={2} />
            </TouchableOpacity>
          ) : t.status !== "done" ? (
            <TouchableOpacity
              onPress={() => startTimer(t.id)}
              style={[st.compactCtrl, { backgroundColor: colors.accentBg }]}
            >
              <Play size={14} color={colors.accent} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => removeTimer(t.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // ─── Full Card ───
  const renderFullCard = (t: TimerData) => {
    const isDone = t.status === "done";
    const isIdle = t.status === "idle";

    return (
      <Animated.View
        key={t.id}
        style={[
          st.card,
          {
            backgroundColor: isDone
              ? (doneFlash.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.card, "#FEE2E2"],
                }) as any)
              : colors.card,
            borderColor: isDone ? "#DC2626" : colors.cardBorder,
          },
        ]}
      >
        {/* Header: name + close */}
        <View style={st.cardHeader}>
          <TextInput
            style={[st.nameInput, { color: colors.text }]}
            value={t.name}
            onChangeText={(v) => setTimerField(t.id, "name", v)}
            placeholder="Timer name"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            onPress={() => removeTimer(t.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Quick name suggestions */}
        {isIdle && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={st.quickRow}
            contentContainerStyle={{ gap: 6, paddingRight: 8 }}
          >
            {QUICK_NAMES.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTimerField(t.id, "name", name);
                }}
                style={[
                  st.quickPill,
                  {
                    backgroundColor:
                      t.name === name ? colors.accent : colors.surface,
                    borderColor:
                      t.name === name ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    st.quickPillText,
                    { color: t.name === name ? "#FFFFFF" : colors.textMuted },
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Ring clock */}
        <View style={st.ringWrap}>{renderRing(t)}</View>

        {/* Scroll picker (idle state only) */}
        {isIdle && (
          <View style={st.pickerRow}>
            <View style={st.pickerCol}>
              <WheelColumn
                count={24}
                value={t.hours}
                onChange={(v) => setTimerField(t.id, "hours", v)}
                textColor={colors.text}
                borderColor={colors.accent}
              />
              <Text style={[st.pickerLabel, { color: colors.textMuted }]}>hr</Text>
            </View>
            <Text style={[st.pickerColon, { color: colors.textMuted }]}>:</Text>
            <View style={st.pickerCol}>
              <WheelColumn
                count={60}
                value={t.minutes}
                onChange={(v) => setTimerField(t.id, "minutes", v)}
                textColor={colors.text}
                borderColor={colors.accent}
              />
              <Text style={[st.pickerLabel, { color: colors.textMuted }]}>min</Text>
            </View>
            <Text style={[st.pickerColon, { color: colors.textMuted }]}>:</Text>
            <View style={st.pickerCol}>
              <WheelColumn
                count={60}
                value={t.seconds}
                onChange={(v) => setTimerField(t.id, "seconds", v)}
                textColor={colors.text}
                borderColor={colors.accent}
              />
              <Text style={[st.pickerLabel, { color: colors.textMuted }]}>sec</Text>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={st.controls}>
          {t.status === "running" ? (
            <TouchableOpacity
              onPress={() => pauseTimer(t.id)}
              style={[st.ctrlBtn, { backgroundColor: "#FEF3C7" }]}
            >
              <Pause size={18} color="#D97706" strokeWidth={2} />
              <Text style={[st.ctrlLabel, { color: "#D97706" }]}>Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => startTimer(t.id)}
              style={[st.ctrlBtn, { backgroundColor: colors.accentBg }]}
            >
              <Play size={18} color={colors.accent} strokeWidth={2} />
              <Text style={[st.ctrlLabel, { color: colors.accent }]}>Start</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => resetTimer(t.id)}
            style={[st.ctrlBtn, { backgroundColor: colors.surface }]}
          >
            <RotateCcw size={18} color={colors.textMuted} strokeWidth={2} />
            <Text style={[st.ctrlLabel, { color: colors.textMuted }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // ─── Render ───
  return (
    <SafeAreaView style={[st.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[st.title, { color: colors.text }]}>Multi Timer</Text>
        <TouchableOpacity
          onPress={addTimer}
          style={[st.addPill, { backgroundColor: colors.accent }]}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={st.addPillText}>Add Timer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {timers.length === 0 && (
          <View style={st.emptyWrap}>
            <Text style={[st.emptyTitle, { color: colors.textMuted }]}>
              No timers yet
            </Text>
            <Text style={[st.emptySub, { color: colors.textMuted }]}>
              Tap "+ Add Timer" to get started
            </Text>
          </View>
        )}

        {timers.map((t) => {
          if (isCompact && expandedId !== t.id) {
            return renderCompactRow(t);
          }
          return renderFullCard(t);
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Timer Done Modal */}
      <Modal
        visible={!!doneModal}
        transparent
        animationType="none"
        onRequestClose={dismissDoneModal}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={dismissDoneModal}
          style={st.modalOverlay}
        >
          <Animated.View
            style={[
              st.modalOverlay,
              { opacity: modalOpacity, backgroundColor: "rgba(0,0,0,0.5)" },
            ]}
          />
          <Animated.View
            style={[
              st.doneModalCard,
              {
                backgroundColor: colors.card,
                transform: [{ scale: modalBounce }],
                opacity: modalOpacity,
              },
            ]}
          >
            {chefAvatar ? (
              <Image
                source={{ uri: chefAvatar }}
                style={st.doneAvatar}
              />
            ) : (
              <View style={[st.doneAvatarPlaceholder, { backgroundColor: colors.accentBg }]}>
                <Volume2 size={32} color={colors.accent} strokeWidth={2} />
              </View>
            )}
            <View style={st.doneSpeechBubble}>
              <Text style={[st.doneSpeechText, { color: colors.text }]}>
                {doneModal?.name} is done, Chef!
              </Text>
            </View>
            <View style={st.doneSpeechArrow} />
            {!chefAvatar && (
              <Text style={[st.doneUpsell, { color: colors.textMuted }]}>
                Create your Chef Avatar to see yourself here!
              </Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───
const st = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", flex: 1 },
  addPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addPillText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  scroll: { padding: 16, gap: 12 },
  emptyWrap: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600" },
  emptySub: { fontSize: 13, marginTop: 4 },
  // Full card
  card: { borderRadius: 14, borderWidth: 1, padding: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  nameInput: { flex: 1, fontSize: 16, fontWeight: "600", padding: 0 },
  quickRow: { marginBottom: 8, marginTop: 4 },
  quickPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickPillText: { fontSize: 12, fontWeight: "600" },
  ringWrap: { alignItems: "center", marginVertical: 8 },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    marginBottom: 8,
  },
  pickerCol: { alignItems: "center" },
  pickerColon: { fontSize: 22, fontWeight: "600", marginTop: -20 },
  pickerLabel: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  controls: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 4,
  },
  ctrlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  ctrlLabel: { fontSize: 14, fontWeight: "600" },
  // Compact row
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  compactName: { flex: 1, fontSize: 14, fontWeight: "600" },
  compactCtrl: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  // Done modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  doneModalCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    width: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  doneAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  doneAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  doneSpeechBubble: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  doneSpeechText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  doneSpeechArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#16A34A",
    marginBottom: 8,
  },
  doneUpsell: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
});
