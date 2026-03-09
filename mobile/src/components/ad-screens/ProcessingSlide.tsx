import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Animated } from "react-native";
import CalligraphyPhase from "../CalligraphyPhase";

const STATUS_LINES = [
  "Looking good",
  "Stirring",
  "Stewing",
  "Seasoning",
  "Plating up",
  "Adding garnish",
  "Almost there",
];

const TYPEWRITER_TEXT = "While you wait, swipe to see what Prep Mi can do for your kitchen →";

function CyclingStatus() {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1) % STATUS_LINES.length);
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Animated.Text style={[s.status, { opacity: fade }]}>
      {STATUS_LINES[index]} ...
    </Animated.Text>
  );
}

function TypewriterText() {
  const [displayed, setDisplayed] = useState("");
  const charIndex = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (charIndex.current < TYPEWRITER_TEXT.length) {
        charIndex.current += 1;
        setDisplayed(TYPEWRITER_TEXT.slice(0, charIndex.current));
      } else {
        clearInterval(timer);
      }
    }, 45);
    return () => clearInterval(timer);
  }, []);

  return (
    <Text style={s.typewriter}>
      {displayed}
      <Text style={s.cursor}>|</Text>
    </Text>
  );
}

export default function ProcessingSlide() {
  return (
    <View style={s.container}>
      {/* Calligraphy animation */}
      <View style={s.calligraphyWrap}>
        <CalligraphyPhase active />
      </View>

      {/* Cycling status */}
      <CyclingStatus />

      <View style={s.row}>
        <ActivityIndicator size="small" color="rgba(0,0,0,0.4)" />
        <Text style={s.sub}>Processing your avatar</Text>
      </View>

      {/* Typewriter nudge */}
      <View style={s.typewriterWrap}>
        <TypewriterText />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  calligraphyWrap: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  status: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1A1A1A",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  sub: {
    fontSize: 14,
    color: "rgba(0,0,0,0.45)",
    fontWeight: "500",
  },
  typewriterWrap: {
    marginTop: 32,
    paddingHorizontal: 8,
    minHeight: 40,
  },
  typewriter: {
    fontSize: 14,
    color: "rgba(0,0,0,0.4)",
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  cursor: {
    color: "rgba(0,0,0,0.5)",
    fontWeight: "300",
  },
});
