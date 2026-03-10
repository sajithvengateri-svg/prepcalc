import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from "react-native";
import {
  Palette,
  Camera,
  Sparkles,
  Share2,
  ChevronRight,
} from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingProps {
  visible: boolean;
  onDone: () => void;
}

const SLIDES = [
  {
    icon: Palette,
    accent: "#EF4444",
    bg: "#FEF2F2",
    title: "Pick Your Style",
    body: "Choose from Anime, Ghibli, Pixel or Comic — then pick a mode like classic avatar, Kitchen Pass ID, or Manga crew.",
  },
  {
    icon: Camera,
    accent: "#2563EB",
    bg: "#EFF6FF",
    title: "Snap a Selfie",
    body: "Tap the camera bubble and take a quick photo. Front or back camera, your call.",
  },
  {
    icon: Sparkles,
    accent: "#7C3AED",
    bg: "#F5F3FF",
    title: "Watch the Magic",
    body: "Sit back while AI transforms your photo. We'll keep you entertained with fun animations while you wait.",
  },
  {
    icon: Share2,
    accent: "#16A34A",
    bg: "#F0FDF4",
    title: "Save & Share",
    body: "Download your avatar, share it with friends, or set it as your profile pic. Sharing is always free!",
  },
];

// Animated icon with gentle pulse
function AnimatedIcon({ Icon, color, isActive }: { Icon: typeof Camera; color: string; isActive: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      scale.setValue(1);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon size={32} color={color} strokeWidth={1.8} />
    </Animated.View>
  );
}

export default function OnboardingWalkthrough({ visible, onDone }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      fadeIn.setValue(0);
      Animated.timing(fadeIn, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (index >= 0 && index < SLIDES.length) setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
      setCurrentIndex(next);
    } else {
      onDone();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const slide = SLIDES[currentIndex];

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onDone}>
      <Animated.View style={[s.backdrop, { opacity: fadeIn }]}>
        <View style={s.card}>
          {/* Accent bar */}
          <View style={[s.accentBar, { backgroundColor: slide.accent }]} />

          {/* Step counter */}
          <Text style={s.stepLabel}>
            {currentIndex + 1} of {SLIDES.length}
          </Text>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((sl, i) => {
              const Icon = sl.icon;
              return (
                <View key={i} style={s.slide}>
                  {/* Icon circle */}
                  <View style={[s.iconCircle, { backgroundColor: sl.bg }]}>
                    <AnimatedIcon Icon={Icon} color={sl.accent} isActive={currentIndex === i} />
                  </View>

                  {/* Title */}
                  <Text style={s.title}>{sl.title}</Text>

                  {/* Body */}
                  <Text style={s.body}>{sl.body}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Dots */}
          <View style={s.dots}>
            {SLIDES.map((sl, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  i === currentIndex
                    ? { backgroundColor: sl.accent, width: 22 }
                    : { backgroundColor: "#D1D5DB", width: 7 },
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity onPress={onDone} style={s.skipBtn} activeOpacity={0.6}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              activeOpacity={0.8}
              style={[s.nextBtn, { backgroundColor: slide.accent }]}
            >
              <Text style={s.nextText}>{isLast ? "Let's Go!" : "Next"}</Text>
              {!isLast && <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const CARD_WIDTH = SCREEN_WIDTH - 48;

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.97)",
    paddingBottom: 24,
    overflow: "hidden",
    // Glass shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  accentBar: {
    height: 4,
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  slide: {
    width: CARD_WIDTH,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    color: "#6B7280",
    paddingHorizontal: 4,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    marginBottom: 24,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
