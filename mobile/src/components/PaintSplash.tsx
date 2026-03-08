import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PALETTE = ["#16A34A", "#2563EB", "#DB2777", "#7C3AED", "#F59E0B", "#EF4444"];
const SPLASH_INTERVAL = 500; // new splatter every 0.5s
const MAX_SPLATTERS = 40;

interface Splatter {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  isBlob: boolean; // circle vs irregular shape
  rotation: number;
  scaleX: number;
  scaleY: number;
  fadeAnim: Animated.Value;
}

interface PaintSplashProps {
  active?: boolean;
}

export default function PaintSplash({ active = true }: PaintSplashProps) {
  const [splatters, setSplatters] = useState<Splatter[]>([]);
  const counterRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;

    timerRef.current = setInterval(() => {
      const id = counterRef.current++;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const size = 40 + Math.random() * 80; // 40-120px
      const fadeAnim = new Animated.Value(0);

      const newSplatter: Splatter = {
        id,
        x: Math.random() * (SCREEN_WIDTH - size),
        y: Math.random() * (SCREEN_HEIGHT - size - 100) + 50, // avoid top/bottom bars
        size,
        color,
        opacity: 0.15 + Math.random() * 0.15, // 0.15-0.3
        isBlob: Math.random() > 0.4, // 60% blobs, 40% circles
        rotation: Math.random() * 360,
        scaleX: 0.7 + Math.random() * 0.6, // 0.7-1.3
        scaleY: 0.7 + Math.random() * 0.6,
        fadeAnim,
      };

      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      setSplatters((prev) => {
        const next = [...prev, newSplatter];
        // Cap at MAX_SPLATTERS to prevent perf issues
        if (next.length > MAX_SPLATTERS) {
          return next.slice(next.length - MAX_SPLATTERS);
        }
        return next;
      });
    }, SPLASH_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  return (
    <View style={st.container}>
      {splatters.map((s) => (
        <Animated.View
          key={s.id}
          style={[
            st.splatter,
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              opacity: Animated.multiply(s.fadeAnim, new Animated.Value(s.opacity)),
              borderRadius: s.isBlob ? s.size * 0.35 : s.size / 2,
              transform: [
                { rotate: `${s.rotation}deg` },
                { scaleX: s.scaleX },
                { scaleY: s.scaleY },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  splatter: {
    position: "absolute",
  },
});
