import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
  Image,
  Modal,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Camera,
  Sparkles,
  Share2,
  RotateCcw,
  Download,
  RefreshCw,
  Lock,
  Film,
  Columns2,
  CreditCard,
  Users,
  Copy,
  Gift,
  Zap,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { useAuth } from "../../src/contexts/AuthProvider";
import { supabase } from "../../src/lib/supabase";
import AdSlideshow from "../../src/components/AdSlideshow";
import PaintSplash from "../../src/components/PaintSplash";
import AuthSheet from "../../src/components/AuthSheet";
import CalligraphyPhase from "../../src/components/CalligraphyPhase";
import OnboardingWalkthrough from "../../src/components/OnboardingWalkthrough";

type AvatarStyle = "Anime" | "Ghibli" | "Pixel" | "Comic";
type AvatarMode = "standard" | "kitchen_pass" | "manga_menu";
type GenPhase = "idle" | "loading" | "result" | "error" | "timeout";

const AVATAR_MODES: { id: AvatarMode; label: string; desc: string; icon: typeof Camera; accent: string }[] = [
  { id: "standard", label: "Channel Your Inner Chef", desc: "Your selfie, anime-fied", icon: Sparkles, accent: "#EF4444" },
  { id: "kitchen_pass", label: "Kitchen Pass", desc: "Anime ID card with your title", icon: CreditCard, accent: "#7C3AED" },
  { id: "manga_menu", label: "Manga Menu", desc: "Group photo to manga crew", icon: Users, accent: "#2563EB" },
];

const CHEF_TITLES = [
  "Grill Superstar",
  "Sauce Stallone",
  "Pastry Picasso",
  "Wok Legend",
  "Knife Ninja",
  "Sauté Samurai",
  "Flavour Boss",
  "Umami King",
  "Mise en Place Master",
  "The Sous Whisperer",
  "Brûlée Baron",
  "Dough Commander",
  "Plating Prodigy",
  "Char Grillionaire",
  "Spice Architect",
  "Reduction Royalty",
  "Pan Flip Phantom",
  "Fermentation Wizard",
  "Braise Blazer",
  "The Julienne Jedi",
];

const getRandomTitle = () => CHEF_TITLES[Math.floor(Math.random() * CHEF_TITLES.length)];

const TIMEOUT_MS = 60_000; // 60s hard timeout
const POLL_INTERVAL_MS = 3_000; // 3s polling

// Status text phases — fun chef narration
const STATUS_MESSAGES = [
  "Creating your chef anime...",
  "Scanning your features...",
  "Extracting your style...",
  "Mixing the colours...",
  "Adding kitchen vibes...",
  "Plating up...",
  "Final touches...",
  "Almost there...",
];
const STATUS_INTERVAL_MS = 5_000; // 5s per phase
const CALLIGRAPHY_DELAY_MS = 24_000; // switch to calligraphy after 24s

// Late-phase status messages (calligraphy phase)
const LATE_STATUS_MESSAGES = [
  "Still creating...",
  "Final seasoning...",
  "Almost at the pass...",
  "Any second now...",
];

const FUNC_NAME = "generate-anime-avatar";

export default function AvatarScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, useAvatarCredit, isLoading: authLoading } = useAuth();
  const [showNoCreditModal, setShowNoCreditModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>("Anime");
  const [selectedMode, setSelectedMode] = useState<AvatarMode>("standard");
  const [chefTitle, setChefTitle] = useState(getRandomTitle);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [genPhase, setGenPhase] = useState<GenPhase>("idle");
  const [genError, setGenError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [showFeaturePreview, setShowFeaturePreview] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [inCalligraphyPhase, setInCalligraphyPhase] = useState(false);
  // Share credits from profile or default 3
  const shareCredits = profile?.avatarCredits ?? 3;

  // Load feature preview preference
  useEffect(() => {
    AsyncStorage.getItem("show_feature_preview").then((val) => {
      if (val !== null) setShowFeaturePreview(val === "true");
    });
  }, []);

  // Show onboarding walkthrough on first sign-in
  useEffect(() => {
    if (user) {
      AsyncStorage.getItem("onboarding_seen").then((val) => {
        if (!val) setShowOnboarding(true);
      });
    }
  }, [user]);

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    AsyncStorage.setItem("onboarding_seen", "true");
  };

  // Refs for managing async generation flow
  const jobIdRef = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastBase64Ref = useRef<string>("");

  // Animation values
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0)).current;
  const statusFade = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Film strip sprocket scroll animation
  const sprocketScroll = useRef(new Animated.Value(0)).current;
  const filmIconRotate = useRef(new Animated.Value(0)).current;
  // Calligraphy crossfade
  const calligraphyFade = useRef(new Animated.Value(0)).current;
  const calligraphyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Camera idle animations
  const glowAnim = useRef(new Animated.Value(1)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;
  const shutterAnim = useRef(new Animated.Value(0)).current;
  const lensRotate = useRef(new Animated.Value(0)).current;

  // --- Camera idle animations ---
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(lensRotate, { toValue: 1, duration: 20000, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(shutterAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(shutterAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // --- Status message cycling during loading ---
  useEffect(() => {
    if (genPhase !== "loading") {
      setStatusIndex(0);
      setInCalligraphyPhase(false);
      progressWidth.setValue(0);
      calligraphyFade.setValue(0);
      if (calligraphyTimerRef.current) { clearTimeout(calligraphyTimerRef.current); calligraphyTimerRef.current = null; }
      return;
    }

    // Animate progress bar over 60s
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: TIMEOUT_MS,
      useNativeDriver: false,
    }).start();

    // Film strip sprocket scroll — slow continuous loop
    sprocketScroll.setValue(0);
    Animated.loop(
      Animated.timing(sprocketScroll, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Film icon slow rotation
    filmIconRotate.setValue(0);
    Animated.loop(
      Animated.timing(filmIconRotate, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    // Cycle status messages with fade
    let step = 0;
    let lateStep = 0;
    let isLatePhase = false;
    setStatusIndex(0);
    statusFade.setValue(1);

    statusTimerRef.current = setInterval(() => {
      Animated.timing(statusFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        if (isLatePhase) {
          lateStep = (lateStep + 1) % LATE_STATUS_MESSAGES.length;
          setStatusIndex(lateStep);
        } else {
          step = Math.min(step + 1, STATUS_MESSAGES.length - 1);
          setStatusIndex(step);
        }
        Animated.timing(statusFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, STATUS_INTERVAL_MS);

    // 24s calligraphy trigger — crossfade from ads/paint to calligraphy
    calligraphyTimerRef.current = setTimeout(() => {
      isLatePhase = true;
      lateStep = 0;
      setStatusIndex(0);
      setInCalligraphyPhase(true);
      Animated.timing(calligraphyFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, CALLIGRAPHY_DELAY_MS);

    return () => {
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
      if (calligraphyTimerRef.current) { clearTimeout(calligraphyTimerRef.current); calligraphyTimerRef.current = null; }
    };
  }, [genPhase]);

  // --- Cleanup all timers on unmount ---
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
      if (calligraphyTimerRef.current) clearTimeout(calligraphyTimerRef.current);
    };
  }, []);

  // --- Stop all generation timers ---
  const stopAllTimers = useCallback(() => {
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    if (timeoutTimerRef.current) { clearTimeout(timeoutTimerRef.current); timeoutTimerRef.current = null; }
    if (statusTimerRef.current) { clearInterval(statusTimerRef.current); statusTimerRef.current = null; }
    if (calligraphyTimerRef.current) { clearTimeout(calligraphyTimerRef.current); calligraphyTimerRef.current = null; }
  }, []);

  // --- Transition to result with sparkle ---
  const showResult = useCallback((imageUrl: string) => {
    stopAllTimers();
    setGeneratedImage(imageUrl);
    setGenPhase("result");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    resultOpacity.setValue(0);
    sparkleScale.setValue(0);
    Animated.sequence([
      Animated.timing(resultOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(sparkleScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
    ]).start();
  }, [stopAllTimers]);

  // --- Show error/timeout ---
  const showError = useCallback((message: string, isTimeout: boolean = false) => {
    stopAllTimers();
    setGenError(message);
    setGenPhase(isTimeout ? "timeout" : "error");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [stopAllTimers]);

  // --- Poll for job status ---
  const startPolling = useCallback((jobId: string) => {
    pollTimerRef.current = setInterval(async () => {
      try {
        const { data: job, error } = await supabase.functions.invoke(FUNC_NAME, {
          body: { mode: "check", job_id: jobId },
        });

        if (error) return; // Network blip — keep polling

        if (job.status === "completed" && job.image_url) {
          showResult(job.image_url);
        } else if (job.status === "failed") {
          showError(job.error || "Image generation failed");
        }
        // "pending" or "generating" → keep polling
      } catch {
        // Network blip — keep polling, timeout will catch it
      }
    }, POLL_INTERVAL_MS);
  }, [showResult, showError]);

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Auth success callback — immediately launch camera
  const handleAuthSuccess = useCallback(() => {
    setShowAuthSheet(false);
    // Small delay to let sheet dismiss and auth state to propagate, then launch camera
    setTimeout(() => launchCamera(), 500);
  }, []);

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(bubbleScale, { toValue: 0.94, duration: 100, useNativeDriver: true }),
      Animated.timing(bubbleScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Gate behind auth — but don't gate if still loading session
    if (!user && !authLoading) {
      setShowAuthSheet(true);
      return;
    }
    if (authLoading) {
      // Session still loading, wait a moment and retry
      setTimeout(() => handleCapture(), 500);
      return;
    }

    // Gate behind credits
    if (profile && profile.avatarCredits <= 0) {
      setShowNoCreditModal(true);
      return;
    }

    await launchCamera();
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Access Required",
        "Please enable camera access in your device settings to use Anime Chef Studio."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      startGeneration(result.assets[0].base64 || "");
    }
  };

  // --- Main generation flow ---
  const startGeneration = async (base64: string) => {
    // Reset state
    stopAllTimers();
    setGeneratedImage(null);
    setGenError(null);
    setStatusIndex(0);
    resultOpacity.setValue(0);
    sparkleScale.setValue(0);
    progressWidth.setValue(0);
    statusFade.setValue(1);
    lastBase64Ref.current = base64;

    // Enter loading phase immediately
    setGenPhase("loading");

    try {
      // Step 1: Start — sends selfie, gets back job_id immediately
      // Assign a fresh random title for kitchen pass mode
      if (selectedMode === "kitchen_pass") {
        setChefTitle(getRandomTitle());
      }

      const { data: startData, error: startError } = await supabase.functions.invoke(FUNC_NAME, {
        body: {
          image_base64: base64,
          style: selectedStyle.toLowerCase(),
          avatar_mode: selectedMode,
          ...(selectedMode === "kitchen_pass" ? { chef_title: chefTitle } : {}),
        },
      });

      if (startError) throw new Error(startError.message || "Failed to start");
      if (!startData?.job_id) throw new Error(startData?.error || "No job ID returned");

      const jobId = startData.job_id;
      jobIdRef.current = jobId;

      // Deduct one avatar credit on successful generation start
      await useAvatarCredit();

      // Step 2: Start polling every 3s
      startPolling(jobId);

      // Step 3: 60s hard timeout
      timeoutTimerRef.current = setTimeout(() => {
        showError("That took too long. Tap to try again.", true);
      }, TIMEOUT_MS);

    } catch (err: any) {
      showError(err.message || "Could not start generation");
    }
  };

  // --- Try Again handler ---
  const handleTryAgain = () => {
    tap();
    if (lastBase64Ref.current) {
      startGeneration(lastBase64Ref.current);
    } else {
      // No saved base64 — go back to camera
      setGenPhase("idle");
      setGenError(null);
      setCapturedImage(null);
    }
  };

  const getCaption = (mode: AvatarMode, title?: string): string => {
    switch (mode) {
      case "standard":
        if (selectedMode === "standard") {
          return "How I feel at 7PM on a Saturday vs how my mum thinks I look. Made with PrepCam #YesChef #KitchenLife";
        }
        return "Check out my anime chef look. Made with PrepCam #KitchenHero #AnimeChef";
      case "kitchen_pass":
        return `Officially a ${title || "Verified Chef"}. Made with PrepCam #VerifiedChef #KitchenPass`;
      case "manga_menu":
        return "The brigade, anime edition. Made with PrepCam #KitchenHero #TheBrigade";
      default:
        return "Check out my anime chef look. Made with PrepCam #KitchenHero #AnimeChef";
    }
  };

  const currentCaption = getCaption(selectedMode);

  const handleCopyCaption = async () => {
    tap();
    await Clipboard.setStringAsync(currentCaption);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Copied", "Caption copied to clipboard");
  };

  const handleShare = async () => {
    tap();
    if (!generatedImage || generatedImage === "placeholder") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Share", currentCaption);
      return;
    }
    try {
      const fileUri = FileSystem.cacheDirectory + "anime-avatar-share.png";
      await FileSystem.downloadAsync(generatedImage, fileUri);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: currentCaption,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Sharing not available on this device");
      }
    } catch (err: any) {
      Alert.alert("Share Failed", err.message || "Could not share image.");
    }
  };

  const handleSaveToPhotos = async () => {
    tap();
    if (!generatedImage || generatedImage === "placeholder") {
      Alert.alert("No Image", "Generate an avatar first.");
      return;
    }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow photo library access to save images.");
        return;
      }
      const fileUri = FileSystem.cacheDirectory + "anime-avatar.png";
      const download = await FileSystem.downloadAsync(generatedImage, fileUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved!", "Avatar saved to your photo library.");
    } catch (err: any) {
      Alert.alert("Save Failed", err.message || "Could not save image.");
    }
  };

  const handleRetry = () => {
    tap();
    setGenPhase("idle");
    setGeneratedImage(null);
    setCapturedImage(null);
    setGenError(null);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.headerTitle, { color: colors.text }]}>
            Anime Chef Studio
          </Text>
          <Text style={[s.headerSub, { color: colors.textMuted }]}>
            Selfie to anime chef avatar
          </Text>
        </View>

        {/* SLR Camera Lens Bubble */}
        {genPhase === "idle" && !generatedImage && (
          <View style={s.bubbleSection}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCapture}
              style={s.lensOuter}
            >
              {/* Outer lens ring — slow rotate */}
              <Animated.View
                style={[
                  s.lensRingOuter,
                  {
                    borderColor: colors.accent,
                    transform: [
                      { scale: glowAnim },
                      {
                        rotate: lensRotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Lens ring grip marks */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                  (deg) => (
                    <View
                      key={deg}
                      style={[
                        s.lensGripMark,
                        {
                          backgroundColor: colors.accent + "40",
                          transform: [
                            { rotate: `${deg}deg` },
                            { translateY: -108 },
                          ],
                        },
                      ]}
                    />
                  )
                )}
              </Animated.View>

              {/* Inner lens body */}
              <Animated.View
                style={[
                  s.lensBody,
                  { transform: [{ scale: bubbleScale }] },
                ]}
              >
                {/* Lens glass (dark) */}
                <View style={s.lensGlass}>
                  {/* Inner ring details */}
                  <View style={[s.lensInnerRing, { borderColor: "#333333" }]} />
                  <View style={[s.lensInnerRing2, { borderColor: "#222222" }]} />

                  {/* Shutter blades — 8 blades that scale to open/close */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <Animated.View
                      key={deg}
                      style={[
                        s.shutterBladeNew,
                        {
                          transform: [
                            { rotate: `${deg}deg` },
                            { translateY: -30 },
                            {
                              scaleY: shutterAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0.15],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  ))}

                  {/* Centre aperture — visible when shutter opens */}
                  <Animated.View
                    style={[
                      s.apertureCentre,
                      {
                        opacity: shutterAnim,
                        transform: [
                          {
                            scale: shutterAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Camera size={36} color="#FFFFFF" strokeWidth={1.5} />
                  </Animated.View>

                  {/* Lens reflection highlight */}
                  <View style={s.lensReflection} />
                </View>
              </Animated.View>
            </TouchableOpacity>

            {/* Lock overlay when not signed in */}
            {!user && !authLoading && (
              <View style={s.lockOverlay}>
                <Lock size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            )}

            <Text style={[s.bubbleLabel, { color: colors.text }]}>
              {authLoading ? "Loading..." : user ? "Tap to capture" : "Sign in to create"}
            </Text>
            <Text style={[s.bubbleSub, { color: colors.textMuted }]}>
              {user
                ? `${shareCredits} free avatar${shareCredits !== 1 ? "s" : ""} remaining`
                : "One tap sign-in · 3 free avatars"}
            </Text>
          </View>
        )}

        {/* === TIMEOUT === */}
        {genPhase === "timeout" && (
          <View style={s.generatingSection}>
            <View style={[s.errorCircle, { backgroundColor: "#FEF3C7" }]}>
              <RefreshCw size={36} color="#D97706" strokeWidth={1.5} />
            </View>
            <Text style={[s.generatingText, { color: colors.text, marginTop: 16 }]}>
              That took too long
            </Text>
            <Text style={[s.generatingSubtext, { color: colors.textMuted, marginTop: 4 }]}>
              Tap to try again
            </Text>
            <TouchableOpacity
              onPress={handleTryAgain}
              style={[s.tryAgainBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={s.tryAgainBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === ERROR === */}
        {genPhase === "error" && (
          <View style={s.generatingSection}>
            <View style={[s.errorCircle, { backgroundColor: "#FEE2E2" }]}>
              <RefreshCw size={36} color="#DC2626" strokeWidth={1.5} />
            </View>
            <Text style={[s.generatingText, { color: colors.text, marginTop: 16 }]}>
              Generation failed
            </Text>
            <Text style={[s.generatingSubtext, { color: colors.textMuted, marginTop: 4 }]}>
              {genError || "Tap to try again"}
            </Text>
            <TouchableOpacity
              onPress={handleTryAgain}
              style={[s.tryAgainBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={s.tryAgainBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* === RESULT === */}
        {genPhase === "result" && generatedImage && (
          <Animated.View style={[s.previewSection, { opacity: resultOpacity }]}>
            <View
              style={[
                s.previewBox,
                { backgroundColor: "#1A1A1A", borderColor: colors.cardBorder },
              ]}
            >
              {generatedImage !== "placeholder" ? (
                <Image
                  source={{ uri: generatedImage }}
                  style={s.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={s.previewPlaceholder}>
                  <Sparkles size={48} color="#22C55E" strokeWidth={1.5} />
                  <Text style={s.previewPlaceholderText}>
                    AI Generated Preview
                  </Text>
                  <Text style={s.previewPlaceholderSub}>
                    {selectedStyle} Style
                  </Text>
                  <Text style={[s.previewPlaceholderSub, { marginTop: 8 }]}>
                    Set OPENAI_API_KEY to generate real images
                  </Text>
                </View>
              )}

              {/* Sparkle overlay */}
              <Animated.View style={[s.sparkleOverlay, { transform: [{ scale: sparkleScale }] }]}>
                <Sparkles size={32} color="#FFFFFF" strokeWidth={1.5} />
              </Animated.View>
            </View>

            {/* Chef Title — Kitchen Pass mode */}
            {selectedMode === "kitchen_pass" && (
              <View style={s.chefTitleBadge}>
                <Text style={s.chefTitleText}>{chefTitle}</Text>
              </View>
            )}

            {/* Caption */}
            <View style={s.captionSection}>
              <Text style={[s.captionLabel, { color: colors.textMuted }]}>Caption</Text>
              <View style={[s.captionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.captionText, { color: colors.text }]} numberOfLines={3}>
                  {currentCaption}
                </Text>
                <TouchableOpacity onPress={handleCopyCaption} style={s.copyBtn}>
                  <Copy size={16} color={colors.accent} strokeWidth={2} />
                  <Text style={[s.copyBtnText, { color: colors.accent }]}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Credits badge */}
            <View style={[s.creditsBadge, { backgroundColor: shareCredits > 0 ? "#DCFCE7" : "#FEF3C7" }]}>
              <Text style={[s.creditsBadgeText, { color: shareCredits > 0 ? "#16A34A" : "#D97706" }]}>
                {shareCredits > 0
                  ? `${shareCredits} credit${shareCredits !== 1 ? "s" : ""} remaining`
                  : "No credits remaining"}
              </Text>
            </View>

            <View style={s.previewActions}>
              <TouchableOpacity
                onPress={handleRetry}
                style={[
                  s.actionBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <RotateCcw size={18} color={colors.text} strokeWidth={2} />
                <Text style={[s.actionBtnText, { color: colors.text }]}>
                  Retry
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={[
                  s.actionBtn,
                  s.actionBtnPrimary,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Share2 size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={s.actionBtnPrimaryText}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>

            {/* Save to Photos */}
            {generatedImage !== "placeholder" && (
              <TouchableOpacity
                onPress={handleSaveToPhotos}
                style={[
                  s.saveBtn,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <Download size={18} color={colors.accent} strokeWidth={2} />
                <Text style={[s.saveBtnText, { color: colors.accent }]}>
                  Save to Photos
                </Text>
              </TouchableOpacity>
            )}

            {/* Set as Chef Avatar */}
            {generatedImage !== "placeholder" && (
              <TouchableOpacity
                onPress={async () => {
                  tap();
                  if (generatedImage) {
                    await AsyncStorage.setItem("chef_avatar_url", generatedImage);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert("Chef Avatar Set!", "Your avatar will appear on timers and your profile.");
                  }
                }}
                style={[
                  s.saveBtn,
                  { backgroundColor: "#DCFCE7", borderColor: "#16A34A", marginTop: 8 },
                ]}
              >
                <Camera size={18} color="#16A34A" strokeWidth={2} />
                <Text style={[s.saveBtnText, { color: "#16A34A" }]}>
                  Set as Chef Avatar
                </Text>
              </TouchableOpacity>
            )}

            {/* Try another style */}
            <TouchableOpacity
              onPress={() => {
                tap();
                setGenPhase("idle");
                setGeneratedImage(null);
                setCapturedImage(null);
              }}
              style={[
                s.saveBtn,
                { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 8 },
              ]}
            >
              <RotateCcw size={16} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[s.saveBtnText, { color: colors.textSecondary }]}>
                Try Another Style
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Style Selector — only when idle or showing result */}
        {(genPhase === "idle" || genPhase === "result") && <View style={s.styleSection}>
          <Text style={[s.styleLabel, { color: colors.text }]}>Style</Text>
          <View style={s.stylePills}>
            {(["Anime", "Ghibli", "Pixel", "Comic"] as AvatarStyle[]).map(
              (st) => (
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
                        color:
                          selectedStyle === st ? "#FFFFFF" : colors.textMuted,
                      },
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>}

        {/* Mode Selector — only when idle */}
        {genPhase === "idle" && (
          <View style={s.modeSection}>
            <Text style={[s.styleLabel, { color: colors.text }]}>Mode</Text>
            {AVATAR_MODES.map((mode) => {
              const ModeIcon = mode.icon;
              const active = selectedMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  onPress={() => { tap(); setSelectedMode(mode.id); }}
                  style={[
                    s.modePill,
                    {
                      backgroundColor: active ? mode.accent + "15" : colors.surface,
                      borderColor: active ? mode.accent : colors.border,
                      borderLeftColor: mode.accent,
                      borderLeftWidth: 3,
                    },
                  ]}
                >
                  <View style={[s.modePillIcon, { backgroundColor: mode.accent + "18" }]}>
                    <ModeIcon size={17} color={mode.accent} strokeWidth={2} />
                  </View>
                  <View style={s.modePillText}>
                    <Text style={[s.modePillName, { color: colors.text }]}>{mode.label}</Text>
                    <Text style={[s.modePillDesc, { color: colors.textMuted }]}>{mode.desc}</Text>
                  </View>
                  {active && (
                    <View style={[s.modeActiveDot, { backgroundColor: mode.accent }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* How it works — only when idle */}
        {genPhase === "idle" &&
        <View
          style={[
            s.howCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[s.howTitle, { color: colors.text }]}>How it works</Text>
          <View style={s.howStep}>
            <View
              style={[s.howIconWrap, { backgroundColor: colors.accentBg }]}
            >
              <Camera size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={s.howTextWrap}>
              <Text style={[s.howStepTitle, { color: colors.text }]}>
                1. Take a selfie
              </Text>
              <Text style={[s.howStepDesc, { color: colors.textMuted }]}>
                Quick photo, we never store the original
              </Text>
            </View>
          </View>
          <View style={s.howStep}>
            <View
              style={[s.howIconWrap, { backgroundColor: colors.accentBg }]}
            >
              <Sparkles size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={s.howTextWrap}>
              <Text style={[s.howStepTitle, { color: colors.text }]}>
                2. AI creates your anime
              </Text>
              <Text style={[s.howStepDesc, { color: colors.textMuted }]}>
                Choose from 4 unique art styles
              </Text>
            </View>
          </View>
          <View style={s.howStep}>
            <View
              style={[s.howIconWrap, { backgroundColor: colors.accentBg }]}
            >
              <Share2 size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={s.howTextWrap}>
              <Text style={[s.howStepTitle, { color: colors.text }]}>
                3. Share your avatar
              </Text>
              <Text style={[s.howStepDesc, { color: colors.textMuted }]}>
                3 free shares, then $1 for 3 more
              </Text>
            </View>
          </View>
        </View>}

        {/* Priority note */}
        {genPhase === "idle" && <View
          style={[
            s.priorityCard,
            {
              backgroundColor: colors.accentBg,
              borderColor: colors.accent + "40",
            },
          ]}
        >
          <Text style={[s.priorityText, { color: colors.accent }]}>
            Anime buyers get priority access to Prep Mi Pro + 50% off AI credits
            first month.
          </Text>
        </View>}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* === LOADING SCREEN — full screen overlay === */}
      {genPhase === "loading" && (
        <View style={s.loadingOverlay}>
          {/* Full-screen content: ad slides / paint splash / calligraphy */}
          {(() => {
            const topPad = insets.top + 8 + 48 + 8;
            const bottomPad = showFeaturePreview && !inCalligraphyPhase ? 60 + insets.bottom : insets.bottom;
            return (
              <View style={s.slideArea}>
                {/* Early phase: ads or paint splash */}
                <Animated.View style={[s.phaseLayer, { top: topPad, bottom: bottomPad, opacity: inCalligraphyPhase ? calligraphyFade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) : 1 }]}>
                  {showFeaturePreview ? (
                    <AdSlideshow active={genPhase === "loading" && !inCalligraphyPhase} />
                  ) : (
                    <PaintSplash active={genPhase === "loading" && !inCalligraphyPhase} />
                  )}
                </Animated.View>

                {/* Late phase: calligraphy */}
                {inCalligraphyPhase && (
                  <Animated.View style={[s.phaseLayer, { top: topPad, bottom: insets.bottom, opacity: calligraphyFade }]}>
                    <CalligraphyPhase active={genPhase === "loading"} />
                  </Animated.View>
                )}
              </View>
            );
          })()}

          {/* Film strip banner — below safe area */}
          <View style={[s.filmStrip, { top: insets.top + 8 }]}>
            {/* Top sprocket holes */}
            <View style={s.sprocketRow}>
              <Animated.View
                style={[
                  s.sprocketTrack,
                  {
                    transform: [{
                      translateX: sprocketScroll.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -96],
                      }),
                    }],
                  },
                ]}
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <View key={`t${i}`} style={s.sprocketHole} />
                ))}
              </Animated.View>
            </View>

            {/* Main content row */}
            <View style={s.filmContent}>
              <Animated.View
                style={{
                  transform: [{
                    rotate: filmIconRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  }],
                }}
              >
                <Film size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
              </Animated.View>

              <Animated.Text
                style={[s.filmStatusText, { opacity: statusFade }]}
                numberOfLines={1}
              >
                {inCalligraphyPhase
                  ? LATE_STATUS_MESSAGES[statusIndex % LATE_STATUS_MESSAGES.length]
                  : STATUS_MESSAGES[statusIndex]}
              </Animated.Text>

              <Text style={s.frameCounter}>
                F{String(statusIndex + 1).padStart(2, "0")}
              </Text>
            </View>

            {/* Bottom sprocket holes */}
            <View style={s.sprocketRow}>
              <Animated.View
                style={[
                  s.sprocketTrack,
                  {
                    transform: [{
                      translateX: sprocketScroll.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -96],
                      }),
                    }],
                  },
                ]}
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <View key={`b${i}`} style={s.sprocketHole} />
                ))}
              </Animated.View>
            </View>
          </View>

          {/* Bottom footer — compact, only with feature preview and not in calligraphy */}
          {showFeaturePreview && !inCalligraphyPhase && (
            <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <Text style={s.bottomBarText}>Prep Mi Student + Pro — coming soon</Text>
            </View>
          )}
        </View>
      )}

      {/* Auth bottom sheet */}
      <AuthSheet
        visible={showAuthSheet}
        onDismiss={() => setShowAuthSheet(false)}
        onSuccess={handleAuthSuccess}
      />

      <OnboardingWalkthrough
        visible={showOnboarding}
        onDone={handleOnboardingDone}
      />

      {/* 0-Credit Prompt Modal */}
      <Modal
        visible={showNoCreditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNoCreditModal(false)}
      >
        <View style={s.noCreditOverlay}>
          <View style={[s.noCreditCard, { backgroundColor: colors.card }]}>
            <Text style={[s.noCreditTitle, { color: colors.text }]}>
              You've used all your free credits!
            </Text>
            <Text style={[s.noCreditSub, { color: colors.textMuted }]}>
              Your anime chef avatars were pretty epic though.
            </Text>

            <View style={[s.noCreditDivider, { borderColor: colors.border }]}>
              <Text style={[s.noCreditDividerText, { color: colors.textMuted }]}>
                Earn More (free)
              </Text>
            </View>

            <Text style={[s.noCreditBody, { color: colors.textMuted }]}>
              Share PrepCam with a friend.{"\n"}Each friend who joins = 1 credit.{"\n"}(up to 10 bonus credits)
            </Text>

            <TouchableOpacity
              onPress={async () => {
                setShowNoCreditModal(false);
                const referralCode = profile?.referralCode || "";
                const msg = `Hey! Check out PrepCam — it turns your selfie into an anime chef avatar. It's free and actually hilarious. Use my code ${referralCode} and we both get bonus credits.\n\nhttps://apps.apple.com/app/prepcam/id`;
                try { await Share.share({ message: msg }); } catch {}
              }}
              style={[s.noCreditShareBtn, { backgroundColor: colors.accent }]}
            >
              <Gift size={18} color="#FFF" strokeWidth={2} />
              <Text style={s.noCreditShareText}>Share with a Friend</Text>
            </TouchableOpacity>

            <View style={[s.noCreditDivider, { borderColor: colors.border }]}>
              <Text style={[s.noCreditDividerText, { color: colors.textMuted }]}>
                or Buy More
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowNoCreditModal(false);
                router.push("/settings/buy-credits");
              }}
              style={[s.noCreditBuyBtn, { borderColor: colors.accent }]}
            >
              <Zap size={16} color={colors.accent} strokeWidth={2} />
              <Text style={[s.noCreditBuyText, { color: colors.accent }]}>
                View Credit Packs
              </Text>
            </TouchableOpacity>

            <Text style={[s.noCreditCredits, { color: colors.textMuted }]}>
              0 credits remaining
            </Text>

            <TouchableOpacity
              onPress={() => setShowNoCreditModal(false)}
              style={s.noCreditClose}
            >
              <Text style={[s.noCreditCloseText, { color: colors.textMuted }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 },
  scrollContent: { paddingHorizontal: 16 },
  header: { paddingVertical: 16, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerSub: { fontSize: 13, marginTop: 4 },
  // SLR Camera Lens
  bubbleSection: { alignItems: "center", marginVertical: 24 },
  lensOuter: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  lensRingOuter: {
    position: "absolute",
    width: 232,
    height: 232,
    borderRadius: 116,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  lensGripMark: {
    position: "absolute",
    width: 3,
    height: 10,
    borderRadius: 1.5,
  },
  lensBody: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#333333",
  },
  lensGlass: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lensInnerRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
  },
  lensInnerRing2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
  },
  shutterBladeNew: {
    position: "absolute",
    width: 50,
    height: 70,
    backgroundColor: "#2A2A2A",
    borderRadius: 4,
  },
  apertureCentre: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(22,163,74,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  lensReflection: {
    position: "absolute",
    top: 20,
    left: 30,
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    transform: [{ rotate: "-30deg" }],
  },
  lockOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FAFAF8",
  },
  bubbleLabel: { fontSize: 16, fontWeight: "700", marginTop: 16 },
  bubbleSub: { fontSize: 13, marginTop: 4 },
  // Loading — full-screen overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: "#FAFAF8",
  },
  slideArea: {
    flex: 1,
  },
  phaseLayer: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  // Film strip banner — slim cinema ticker
  filmStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: "#1A1A1A",
    zIndex: 10,
    justifyContent: "space-between",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sprocketRow: {
    height: 8,
    overflow: "hidden",
  },
  sprocketTrack: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 4,
  },
  sprocketHole: {
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: "#2A2A2A",
    marginTop: 2,
  },
  filmContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  filmStatusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  frameCounter: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 1,
  },
  // Bottom footer — compact
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    zIndex: 10,
  },
  bottomBarText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
  },
  // Error / timeout states
  generatingSection: { alignItems: "center", marginVertical: 30 },
  generatingText: { fontSize: 16, fontWeight: "700" },
  generatingSubtext: { fontSize: 13, marginTop: 4 },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tryAgainBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 20,
  },
  tryAgainBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sparkleOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(22,163,74,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Preview
  previewSection: { marginVertical: 16 },
  previewBox: {
    borderRadius: 14,
    borderWidth: 1,
    aspectRatio: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: { alignItems: "center", gap: 12 },
  previewPlaceholderText: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "700",
  },
  previewPlaceholderSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
  creditsBadge: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 10,
  },
  creditsBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 14, fontWeight: "600" },
  actionBtnPrimary: { borderWidth: 0 },
  actionBtnPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  saveBtnText: { fontSize: 14, fontWeight: "600" },
  // Caption
  chefTitleBadge: {
    marginTop: 12,
    backgroundColor: "#7C3AED",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
  chefTitleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  captionSection: {
    marginTop: 12,
    width: "100%",
  },
  captionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  captionBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  captionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(22,163,74,0.1)",
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Style
  styleSection: { marginVertical: 16 },
  styleLabel: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  stylePills: { flexDirection: "row", gap: 8 },
  stylePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  stylePillText: { fontSize: 13, fontWeight: "600" },
  // Mode selector
  modeSection: { marginBottom: 16 },
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
  modePillDesc: { fontSize: 11, marginTop: 1 },
  modeActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // How
  howCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  howTitle: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  howStep: { flexDirection: "row", gap: 12, marginBottom: 14 },
  howIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  howTextWrap: { flex: 1 },
  howStepTitle: { fontSize: 14, fontWeight: "600" },
  howStepDesc: { fontSize: 12, marginTop: 2 },
  // Priority
  priorityCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  priorityText: { fontSize: 13, fontWeight: "600", lineHeight: 20 },
  // 0-Credit Modal
  noCreditOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noCreditCard: {
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  noCreditTitle: { fontSize: 18, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  noCreditSub: { fontSize: 14, textAlign: "center", marginBottom: 20, lineHeight: 20 },
  noCreditDivider: {
    borderTopWidth: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 12,
  },
  noCreditDividerText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5 },
  noCreditBody: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  noCreditShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    marginBottom: 20,
  },
  noCreditShareText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  noCreditBuyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    width: "100%",
    marginBottom: 16,
  },
  noCreditBuyText: { fontSize: 15, fontWeight: "600" },
  noCreditCredits: { fontSize: 12, marginBottom: 12 },
  noCreditClose: { paddingVertical: 8 },
  noCreditCloseText: { fontSize: 14, fontWeight: "500" },
});
