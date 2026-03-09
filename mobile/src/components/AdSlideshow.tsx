import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  AD_SCREEN_COMPONENTS,
  AD_SCREEN_TITLES,
  AD_SCREEN_SUBTITLES,
  DARK_SLIDES,
  ALL_PRESETS,
  type AdScreenPreset,
} from "./ad-screens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AUTO_SCROLL_INTERVAL = 4000;

interface AdSlideshowProps {
  active?: boolean;
}

export default function AdSlideshow({ active = true }: AdSlideshowProps) {
  const slides = ALL_PRESETS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-scroll every 4s
  useEffect(() => {
    if (!active || slides.length <= 1) return;

    autoScrollTimer.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({
          x: next * SCREEN_WIDTH,
          animated: true,
        });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [active, slides.length]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index !== currentIndex && index >= 0 && index < slides.length) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, slides.length]
  );

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const isDark = DARK_SLIDES.includes(currentSlide);
  const title = AD_SCREEN_TITLES[currentSlide];
  const subtitle = AD_SCREEN_SUBTITLES[currentSlide];

  return (
    <Animated.View style={[st.container, { opacity: fadeAnim }]}>
      {/* Full-screen slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((preset) => {
          const ScreenComponent = AD_SCREEN_COMPONENTS[preset];
          const slideIsDark = DARK_SLIDES.includes(preset);
          const slideTitle = AD_SCREEN_TITLES[preset];
          const slideSub = AD_SCREEN_SUBTITLES[preset];

          return (
            <TouchableOpacity
              key={preset}
              activeOpacity={1}
              style={st.slide}
            >
              <View style={[st.screenContent, { backgroundColor: slideIsDark ? "#0F0F0F" : "#FAFAF8" }]}>
                {/* Header overlay for feature slides (not intro/cta) */}
                {slideTitle ? (
                  <View style={st.slideHeader}>
                    <Text style={[st.slideTitle, { color: slideIsDark ? "#FFFFFF" : "#1A1A1A" }]}>
                      {slideTitle}
                    </Text>
                    {slideSub ? (
                      <Text style={[st.slideSub, { color: slideIsDark ? "#9CA3AF" : "#6B7280" }]}>
                        {slideSub}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                <View style={slideTitle ? st.screenBody : st.screenBodyFull}>
                  <ScreenComponent />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom dots */}
      <View style={st.bottomOverlay}>
        <View style={st.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                st.dot,
                i === currentIndex ? st.dotActive : st.dotInactive,
                isDark && i === currentIndex && { backgroundColor: "#16A34A" },
                isDark && i !== currentIndex && { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
  slideHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  slideSub: {
    fontSize: 12,
    marginTop: 2,
  },
  screenBody: {
    flex: 1,
    paddingHorizontal: 4,
  },
  screenBodyFull: {
    flex: 1,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    backgroundColor: "#16A34A",
    opacity: 0.6,
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
    opacity: 0.4,
  },
});
