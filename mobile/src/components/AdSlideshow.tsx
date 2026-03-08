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
import { AD_SCREEN_COMPONENTS } from "./ad-screens";
import {
  LoadingAd,
  fetchActiveAds,
  pickAdsForSlideshow,
  trackAdEvent,
  FALLBACK_ADS,
} from "../services/adService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AUTO_SCROLL_INTERVAL = 4000;

interface AdSlideshowProps {
  active?: boolean;
}

export default function AdSlideshow({ active = true }: AdSlideshowProps) {
  const [ads, setAds] = useState<LoadingAd[]>(FALLBACK_ADS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch ads on mount
  useEffect(() => {
    let mounted = true;
    fetchActiveAds().then((fetched) => {
      if (mounted) {
        const picked = pickAdsForSlideshow(fetched, 6);
        setAds(picked);
      }
    });
    return () => { mounted = false; };
  }, []);

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
    if (!active || ads.length <= 1) return;

    autoScrollTimer.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % ads.length;
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
  }, [active, ads.length]);

  // Track impression
  useEffect(() => {
    if (ads[currentIndex]) {
      trackAdEvent(ads[currentIndex].id, "impression");
    }
  }, [currentIndex, ads]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index !== currentIndex && index >= 0 && index < ads.length) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, ads.length]
  );

  const handleTap = useCallback((ad: LoadingAd) => {
    trackAdEvent(ad.id, "tap");
  }, []);

  if (ads.length === 0) return null;

  const ad = ads[currentIndex];

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
        {ads.map((ad) => {
          const ScreenComponent = AD_SCREEN_COMPONENTS[ad.screen_preset] || null;

          return (
            <TouchableOpacity
              key={ad.id}
              activeOpacity={1}
              onPress={() => handleTap(ad)}
              style={st.slide}
            >
              <View style={st.screenContent}>
                {ScreenComponent ? <ScreenComponent /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom overlay — title + dots */}
      <View style={st.bottomOverlay}>
        <Text style={st.adTitle}>{ad?.title}</Text>
        <Text style={st.adSub} numberOfLines={1}>{ad?.subtitle}</Text>

        {/* Dot indicators */}
        <View style={st.dots}>
          {ads.map((_, i) => (
            <View
              key={i}
              style={[
                st.dot,
                i === currentIndex ? st.dotActive : st.dotInactive,
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
    backgroundColor: "#FAFAF8",
    padding: 16,
  },
  // Bottom overlay — subtle
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 10,
    alignItems: "center",
  },
  adTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16A34A",
    opacity: 0.7,
  },
  adSub: {
    fontSize: 11,
    color: "rgba(0,0,0,0.35)",
    marginTop: 1,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 6,
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
