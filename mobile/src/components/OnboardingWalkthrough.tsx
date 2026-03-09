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
} from "react-native";
import {
  Palette,
  Camera,
  Sparkles,
  Share2,
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingProps {
  visible: boolean;
  onDone: () => void;
}

const SLIDES = [
  {
    icon: Palette,
    accent: "#EF4444",
    title: "Pick Your Style",
    body: "Choose from Anime, Ghibli, Pixel or Comic.\nThen pick a mode — classic avatar,\nKitchen Pass ID, or Manga crew.",
  },
  {
    icon: Camera,
    accent: "#2563EB",
    title: "Snap a Selfie",
    body: "Tap the camera bubble and take\na quick photo. Front or back camera,\nyour call.",
  },
  {
    icon: Sparkles,
    accent: "#7C3AED",
    title: "Watch the Magic",
    body: "Sit back while AI transforms your\nphoto. We'll keep you entertained\nwith fun animations while you wait.",
  },
  {
    icon: Share2,
    accent: "#16A34A",
    title: "Save & Share",
    body: "Download your avatar, share it\nwith friends, or set it as your\nprofile pic. Sharing is always free!",
  },
];

// Animated icon wrapper — each icon gets a looping pulse + gentle rotate
function AnimatedIcon({ Icon, color, isActive }: { Icon: typeof Camera; color: string; isActive: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      scale.setValue(1);
      rotate.setValue(0);
      return;
    }

    // Pulse scale
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );

    // Gentle wobble rotate
    const rotateLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: -1, duration: 1200, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );

    pulseLoop.start();
    rotateLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [isActive]);

  const rotateInterp = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  return (
    <Animated.View style={{ transform: [{ scale }, { rotate: rotateInterp }] }}>
      <Icon size={36} color={color} strokeWidth={2} />
    </Animated.View>
  );
}

export default function OnboardingWalkthrough({ visible, onDone }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeIn.setValue(0);
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index >= 0 && index < SLIDES.length) setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setCurrentIndex(next);
    } else {
      onDone();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onDone}>
      <Animated.View style={[s.backdrop, { opacity: fadeIn }]}>
        <View style={s.card}>
          {/* Brand header stripe */}
          <View style={[s.headerStripe, { backgroundColor: SLIDES[currentIndex].accent }]} />

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((slide, i) => {
              const Icon = slide.icon;
              return (
                <View key={i} style={s.slide}>
                  <View style={[s.iconCircle, { borderColor: slide.accent + "40" }]}>
                    <AnimatedIcon Icon={Icon} color={slide.accent} isActive={currentIndex === i} />
                  </View>
                  <Text style={s.title}>{slide.title}</Text>
                  <Text style={s.body}>{slide.body}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Dots */}
          <View style={s.dots}>
            {SLIDES.map((slide, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  i === currentIndex
                    ? { backgroundColor: slide.accent, width: 20 }
                    : { backgroundColor: "rgba(255,255,255,0.25)", width: 7 },
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity onPress={onDone} style={s.skipBtn}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              style={[s.nextBtn, { backgroundColor: SLIDES[currentIndex].accent }]}
            >
              <Text style={s.nextText}>{isLast ? "Let's Go!" : "Next"}</Text>
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
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    backgroundColor: "#0F0F0F",
    paddingBottom: 20,
    overflow: "hidden",
  },
  headerStripe: {
    height: 4,
    width: "100%",
    marginBottom: 28,
  },
  slide: {
    width: CARD_WIDTH,
    alignItems: "center",
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: "#FFFFFF",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
    marginBottom: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
  },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
