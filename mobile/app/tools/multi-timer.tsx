import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Plus, Play, Pause, RotateCcw, X } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

interface TimerData {
  id: string;
  name: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  remainingSeconds: number;
  status: "idle" | "running" | "paused" | "done";
}

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function MultiTimerScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [timers, setTimers] = useState<TimerData[]>([]);
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const addTimer = () => {
    if (timers.length >= 5) {
      Alert.alert("Limit reached", "You can run up to 5 timers at once.");
      return;
    }
    setTimers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Timer ${prev.length + 1}`,
        hours: "0",
        minutes: "0",
        seconds: "0",
        totalSeconds: 0,
        remainingSeconds: 0,
        status: "idle",
      },
    ]);
  };

  const removeTimer = (id: string) => {
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateField = useCallback(
    (id: string, field: keyof TimerData, value: string) => {
      setTimers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );
    },
    []
  );

  const startTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        let total = t.totalSeconds;
        let remaining = t.remainingSeconds;
        if (t.status === "idle" || t.status === "done") {
          total =
            (parseInt(t.hours) || 0) * 3600 +
            (parseInt(t.minutes) || 0) * 60 +
            (parseInt(t.seconds) || 0);
          remaining = total;
        }
        if (remaining <= 0) return t;
        return { ...t, totalSeconds: total, remainingSeconds: remaining, status: "running" };
      })
    );

    if (intervalsRef.current[id]) clearInterval(intervalsRef.current[id]);

    intervalsRef.current[id] = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.id !== id || t.status !== "running") return t;
          const next = t.remainingSeconds - 1;
          if (next <= 0) {
            clearInterval(intervalsRef.current[id]);
            delete intervalsRef.current[id];
            return { ...t, remainingSeconds: 0, status: "done" };
          }
          return { ...t, remainingSeconds: next };
        })
      );
    }, 1000);
  };

  const pauseTimer = (id: string) => {
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "paused" } : t))
    );
  };

  const resetTimer = (id: string) => {
    if (intervalsRef.current[id]) {
      clearInterval(intervalsRef.current[id]);
      delete intervalsRef.current[id];
    }
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, remainingSeconds: 0, totalSeconds: 0, status: "idle" }
          : t
      )
    );
  };

  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const getProgress = (t: TimerData): number => {
    if (t.totalSeconds === 0) return 0;
    return ((t.totalSeconds - t.remainingSeconds) / t.totalSeconds) * 100;
  };

  const getBarColor = (t: TimerData): string => {
    if (t.status === "done") return colors.success;
    if (t.status === "running") return colors.accent;
    return colors.textMuted;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Multi Timer</Text>
        <Text style={[styles.countLabel, { color: colors.textMuted }]}>
          {timers.length}/5
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {timers.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No timers yet. Tap the button below to add one.
            </Text>
          )}

          {timers.map((t) => {
            const isEditable = t.status === "idle";
            const isDone = t.status === "done";

            return (
              <View
                key={t.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isDone ? colors.successBg : colors.card,
                    borderColor: isDone ? colors.success : colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.timerHeader}>
                  <TextInput
                    style={[styles.timerName, { color: colors.text }]}
                    value={t.name}
                    onChangeText={(v) => updateField(t.id, "name", v)}
                    placeholder="Timer name"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => removeTimer(t.id)} style={styles.removeBtn}>
                    <X size={18} color={colors.destructive} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {isEditable ? (
                  <View style={styles.timeInputRow}>
                    <View style={styles.timeInputGroup}>
                      <TextInput
                        style={[
                          styles.timeInput,
                          {
                            backgroundColor: colors.inputBg,
                            color: colors.text,
                            borderColor: colors.border,
                          },
                        ]}
                        value={t.hours}
                        onChangeText={(v) => updateField(t.id, "hours", v)}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>h</Text>
                    </View>
                    <View style={styles.timeInputGroup}>
                      <TextInput
                        style={[
                          styles.timeInput,
                          {
                            backgroundColor: colors.inputBg,
                            color: colors.text,
                            borderColor: colors.border,
                          },
                        ]}
                        value={t.minutes}
                        onChangeText={(v) => updateField(t.id, "minutes", v)}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>m</Text>
                    </View>
                    <View style={styles.timeInputGroup}>
                      <TextInput
                        style={[
                          styles.timeInput,
                          {
                            backgroundColor: colors.inputBg,
                            color: colors.text,
                            borderColor: colors.border,
                          },
                        ]}
                        value={t.seconds}
                        onChangeText={(v) => updateField(t.id, "seconds", v)}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>s</Text>
                    </View>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.countdown,
                      { color: isDone ? colors.success : colors.text },
                    ]}
                  >
                    {isDone ? "Done!" : formatTime(t.remainingSeconds)}
                  </Text>
                )}

                {/* Progress bar */}
                {t.totalSeconds > 0 && (
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: getBarColor(t),
                          width: `${Math.min(getProgress(t), 100)}%`,
                        },
                      ]}
                    />
                  </View>
                )}

                {/* Controls */}
                <View style={styles.controlsRow}>
                  {t.status === "running" ? (
                    <TouchableOpacity
                      onPress={() => pauseTimer(t.id)}
                      style={[styles.controlBtn, { backgroundColor: colors.warningBg }]}
                    >
                      <Pause size={18} color={colors.warning} strokeWidth={2} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => startTimer(t.id)}
                      style={[styles.controlBtn, { backgroundColor: colors.accentBg }]}
                    >
                      <Play size={18} color={colors.accent} strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => resetTimer(t.id)}
                    style={[styles.controlBtn, { backgroundColor: colors.surface }]}
                  >
                    <RotateCcw size={18} color={colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            onPress={addTimer}
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Add Timer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", marginLeft: 8, flex: 1 },
  countLabel: { fontSize: 14, fontWeight: "600" },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 40 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  removeBtn: { padding: 4 },
  timeInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  timeInputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeInput: {
    width: 52,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  timeLabel: { fontSize: 14, fontWeight: "500" },
  countdown: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});
