import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS = 200;
const OFFSET_X = (SCREEN_WIDTH - CANVAS) / 2;

// Each stroke: SVG path d, duration in ms, strokeWidth
const STROKES = [
  // Stroke 1: Body — bold vertical line, slight curve for hand-drawn feel
  { d: "M100,180 C98,140 102,100 100,60", dur: 500, sw: 8 },
  // Stroke 2: Shoulders — horizontal with slight droop
  { d: "M55,85 C70,82 130,82 145,85", dur: 500, sw: 6 },
  // Stroke 3: Chef toque — hat shape on top
  { d: "M72,60 C72,25 80,12 100,10 C120,12 128,25 128,60", dur: 500, sw: 5 },
  // Stroke 4a: Left eye dot
  { d: "M88,48 C89,46 91,46 90,48", dur: 150, sw: 5 },
  // Stroke 4b: Right eye dot
  { d: "M110,48 C111,46 113,46 112,48", dur: 150, sw: 5 },
  // Stroke 5: Smile — small curve
  { d: "M92,56 C96,60 104,60 108,56", dur: 300, sw: 3 },
  // Stroke 6a: Steam wisp 1
  { d: "M90,8 C88,-2 92,-8 90,-16", dur: 200, sw: 2 },
  // Stroke 6b: Steam wisp 2
  { d: "M100,6 C102,-4 98,-10 100,-18", dur: 200, sw: 2 },
];

// Total draw time ~2.5s, hold 1s, then fade & redraw

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StrokeAnimProps {
  d: string;
  strokeWidth: number;
  delay: number;
  duration: number;
  masterOpacity: Animated.Value;
}

function StrokeAnim({ d, strokeWidth, delay, duration, masterOpacity }: StrokeAnimProps) {
  const progress = useRef(new Animated.Value(0)).current;
  // Approximate path length — generous estimate for dasharray
  const pathLen = 300;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration,
        useNativeDriver: false, // dashOffset needs non-native
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [pathLen, 0],
  });

  return (
    <AnimatedPath
      d={d}
      stroke="#1A1A1A"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={`${pathLen}`}
      strokeDashoffset={dashOffset}
      opacity={masterOpacity}
    />
  );
}

interface CalligraphyPhaseProps {
  active?: boolean;
}

export default function CalligraphyPhase({ active = true }: CalligraphyPhaseProps) {
  const [cycle, setCycle] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate total draw time
  let totalDelay = 0;
  const strokeTimings: { delay: number; duration: number }[] = [];
  for (const s of STROKES) {
    strokeTimings.push({ delay: totalDelay, duration: s.dur });
    totalDelay += s.dur;
  }
  const drawTime = totalDelay; // ~2.5s
  const holdTime = 1000;
  const fadeTime = 500;
  const cycleTime = drawTime + holdTime + fadeTime + 200; // +200 buffer

  // Loop: draw → hold → fade out → reset → redraw
  const startCycle = useCallback(() => {
    fadeAnim.setValue(1);

    cycleTimer.current = setTimeout(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: fadeTime,
        useNativeDriver: false,
      }).start(() => {
        if (active) {
          setCycle((c) => c + 1); // triggers re-render with fresh strokes
        }
      });
    }, drawTime + holdTime);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    startCycle();
    return () => {
      if (cycleTimer.current) clearTimeout(cycleTimer.current);
    };
  }, [active, cycle, startCycle]);

  if (!active) return null;

  return (
    <View style={st.container}>
      {/* Calligraphy canvas */}
      <View style={st.canvasWrap}>
        <Svg width={CANVAS} height={CANVAS} viewBox="-5 -25 210 210">
          {STROKES.map((s, i) => (
            <StrokeAnim
              key={`${cycle}-${i}`}
              d={s.d}
              strokeWidth={s.sw}
              delay={strokeTimings[i].delay}
              duration={strokeTimings[i].duration}
              masterOpacity={fadeAnim}
            />
          ))}
        </Svg>
      </View>

      {/* Subtitle */}
      <Animated.Text style={[st.subtitle, { opacity: fadeAnim }]}>
        Taking a little longer than usual
      </Animated.Text>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
    alignItems: "center",
    justifyContent: "center",
  },
  canvasWrap: {
    width: CANVAS,
    height: CANVAS,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    marginTop: 24,
    fontSize: 13,
    color: "rgba(0,0,0,0.35)",
    fontWeight: "500",
  },
});
