import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Sparkles,
  Share2,
  RotateCcw,
  Lock,
  ChevronLeft,
} from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

type AvatarStyle = "Anime" | "Ghibli" | "Pixel" | "Comic";

export default function AvatarScreen() {
  const { colors, isDark } = useTheme();
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>("Anime");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Animations
  const glowAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.06,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(bubbleScale, {
        toValue: 0.94,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

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
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      generateAnime(result.assets[0].base64 || "");
    }
  };

  const generateAnime = async (base64: string) => {
    setIsGenerating(true);
    // Simulate AI generation (real implementation calls edge function)
    setTimeout(() => {
      setGeneratedImage(capturedImage); // Placeholder - would be AI-generated
      setIsGenerating(false);
      setCapturedImage(null); // Delete original selfie immediately
    }, 3000);
  };

  const handleUnlock = () => {
    tap();
    // IAP flow placeholder
    Alert.alert(
      "Unlock & Share",
      "This will use In-App Purchase ($1 AUD) to remove the watermark and enable sharing.\n\nProduct ID: au.prepmi.prepcalc.anime.unlock",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Purchase $1",
          onPress: () => {
            setIsUnlocked(true);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
          },
        },
      ]
    );
  };

  const handleRetry = () => {
    tap();
    setGeneratedImage(null);
    setCapturedImage(null);
    setIsUnlocked(false);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
        </View>

        {/* Camera Bubble */}
        {!generatedImage && !isGenerating && (
          <View style={s.bubbleSection}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCapture}
              style={s.bubbleOuter}
            >
              <Animated.View
                style={[s.shutterRing, { transform: [{ rotate: spin }] }]}
              >
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <View
                    key={deg}
                    style={[
                      s.shutterBlade,
                      { transform: [{ rotate: `${deg}deg` }] },
                    ]}
                  />
                ))}
              </Animated.View>
              <Animated.View
                style={[
                  s.glowRing,
                  {
                    borderColor: colors.accent,
                    transform: [{ scale: glowAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  s.greenCircle,
                  { transform: [{ scale: bubbleScale }] },
                ]}
              >
                <Camera size={44} color="#FFFFFF" strokeWidth={1.5} />
                <Text style={s.tapText}>TAP TO CAPTURE</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        {/* Generating State */}
        {isGenerating && (
          <View style={s.generatingSection}>
            <View style={[s.generatingBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                }}
              >
                <Sparkles size={40} color={colors.accent} strokeWidth={1.5} />
              </Animated.View>
              <Text style={[s.generatingText, { color: colors.text }]}>
                Creating your anime avatar...
              </Text>
              <Text style={[s.generatingSubtext, { color: colors.textMuted }]}>
                This usually takes 10-15 seconds
              </Text>
            </View>
          </View>
        )}

        {/* Preview */}
        {generatedImage && !isGenerating && (
          <View style={s.previewSection}>
            <View
              style={[
                s.previewBox,
                { backgroundColor: "#1A1A1A", borderColor: colors.cardBorder },
              ]}
            >
              <View style={s.previewPlaceholder}>
                <Sparkles size={48} color="#22C55E" strokeWidth={1.5} />
                <Text style={s.previewPlaceholderText}>
                  AI Generated Preview
                </Text>
                <Text style={s.previewPlaceholderSub}>
                  {selectedStyle} Style
                </Text>
              </View>
              {!isUnlocked && (
                <View style={s.watermark}>
                  <Lock size={14} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                  <Text style={s.watermarkText}>PREVIEW - WATERMARKED</Text>
                </View>
              )}
            </View>
            <View style={s.previewActions}>
              <TouchableOpacity
                onPress={handleRetry}
                style={[
                  s.actionBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <RotateCcw size={18} color={colors.text} strokeWidth={2} />
                <Text style={[s.actionBtnText, { color: colors.text }]}>
                  Retry
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={isUnlocked ? () => tap() : handleUnlock}
                style={[
                  s.actionBtn,
                  s.actionBtnPrimary,
                  { backgroundColor: colors.accent },
                ]}
              >
                {isUnlocked ? (
                  <Share2 size={18} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <Lock size={18} color="#FFFFFF" strokeWidth={2} />
                )}
                <Text style={s.actionBtnPrimaryText}>
                  {isUnlocked ? "Share" : "Unlock & Share — $1"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Style Selector */}
        <View style={s.styleSection}>
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
        </View>

        {/* How it works */}
        <View
          style={[
            s.howCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[s.howTitle, { color: colors.text }]}>How it works</Text>
          <View style={s.howStep}>
            <View style={[s.howIconWrap, { backgroundColor: colors.accentBg }]}>
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
            <View style={[s.howIconWrap, { backgroundColor: colors.accentBg }]}>
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
            <View style={[s.howIconWrap, { backgroundColor: colors.accentBg }]}>
              <Share2 size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={s.howTextWrap}>
              <Text style={[s.howStepTitle, { color: colors.text }]}>
                3. Preview free, share for $1
              </Text>
              <Text style={[s.howStepDesc, { color: colors.textMuted }]}>
                Download and share your anime chef avatar
              </Text>
            </View>
          </View>
        </View>

        {/* Priority note */}
        <View
          style={[
            s.priorityCard,
            { backgroundColor: colors.accentBg, borderColor: colors.accent + "40" },
          ]}
        >
          <Text style={[s.priorityText, { color: colors.accent }]}>
            Anime buyers get priority access to Prep Mi Pro + 50% off AI credits
            first month.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 },
  scrollContent: { paddingHorizontal: 16 },
  header: { paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  // Bubble
  bubbleSection: { alignItems: "center", marginVertical: 20 },
  bubbleOuter: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterRing: {
    position: "absolute",
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBlade: {
    position: "absolute",
    width: 2,
    height: 180,
    backgroundColor: "rgba(22,163,74,0.15)",
  },
  glowRing: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
  },
  greenCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(22,163,74,0.35)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  tapText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  // Generating
  generatingSection: { alignItems: "center", marginVertical: 30 },
  generatingBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    width: "100%",
  },
  generatingText: { fontSize: 16, fontWeight: "700", marginTop: 16 },
  generatingSubtext: { fontSize: 13, marginTop: 4 },
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
  watermark: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  watermarkText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
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
});
