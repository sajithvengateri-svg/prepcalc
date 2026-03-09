import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";
import {
  ANIMAL_CHARTS,
  type PrimalZone,
  type Cut,
} from "../../src/data/butcheryData";

const { width: SCREEN_W } = Dimensions.get("window");
const IMAGE_ASPECT = 1536 / 1024; // landscape
const IMAGE_W = SCREEN_W - 32;
const IMAGE_H = IMAGE_W / IMAGE_ASPECT;

const METHOD_COLORS: Record<string, string> = {
  Grill: "#EF4444",
  "Pan-sear": "#F97316",
  "Pan-fry": "#F97316",
  Roast: "#8B5CF6",
  Braise: "#3B82F6",
  "Slow cook": "#3B82F6",
  Smoke: "#6B7280",
  BBQ: "#DC2626",
  Fry: "#F59E0B",
  "Stir-fry": "#F59E0B",
  Stew: "#3B82F6",
  Poach: "#06B6D4",
  Bake: "#8B5CF6",
  Stock: "#6B7280",
  Sashimi: "#EC4899",
  "Slice thin": "#6B7280",
};

function yieldColor(pct: number): string {
  if (pct >= 75) return "#16A34A";
  if (pct >= 60) return "#F59E0B";
  return "#EF4444";
}

export default function ButcheryDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const cutsYRef = useRef(0);

  const animal = ANIMAL_CHARTS.find((a) => a.id === id);
  const [selectedZone, setSelectedZone] = useState<PrimalZone | null>(null);

  const totalCuts = animal
    ? animal.zones.reduce((sum, z) => sum + z.cuts.length, 0)
    : 0;

  const handleZoneTap = useCallback(
    (zone: PrimalZone) => {
      setSelectedZone(zone);
      // Scroll to cuts list
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: cutsYRef.current, animated: true });
      }, 100);
    },
    []
  );

  const handleImageBgTap = useCallback(() => {
    setSelectedZone(null);
  }, []);

  const handleCutsLayout = useCallback((e: LayoutChangeEvent) => {
    cutsYRef.current = e.nativeEvent.layout.y;
  }, []);

  if (!animal) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, padding: 20 }}>Chart not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          {animal.name}
        </Text>
        <Text style={[s.headerCount, { color: colors.textSecondary }]}>
          {animal.zones.length} Primals
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart image with tap zones */}
        <View
          style={[
            s.chartCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleImageBgTap}
            style={s.chartWrap}
          >
            <Image
              source={animal.image}
              style={s.chartImage}
              resizeMode="contain"
            />
            {/* Tap zones */}
            {animal.zones.map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  activeOpacity={0.3}
                  onPress={() => handleZoneTap(zone)}
                  style={[
                    s.tapZone,
                    {
                      left: zone.left as any,
                      top: zone.top as any,
                      width: zone.width as any,
                      height: zone.height as any,
                    },
                  ]}
                />
            ))}
          </TouchableOpacity>
        </View>

        <Text style={[s.hint, { color: colors.textMuted }]}>
          Tap a section to explore cuts
        </Text>

        {/* Section info bar */}
        {selectedZone && (
          <View
            style={[
              s.sectionBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={s.sectionAccent} />
            <View style={s.sectionInfo}>
              <Text style={[s.sectionName, { color: colors.text }]}>
                {selectedZone.label}
              </Text>
              <Text style={[s.sectionMeta, { color: colors.textSecondary }]}>
                {selectedZone.cuts.length} cut
                {selectedZone.cuts.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        )}

        {/* Cut cards */}
        <View onLayout={handleCutsLayout}>
          {selectedZone ? (
            selectedZone.cuts.map((cut) => (
              <CutCard key={cut.name} cut={cut} colors={colors} />
            ))
          ) : (
            /* Show all cuts grouped by primal when nothing selected */
            animal.zones.map((zone) => (
              <View key={zone.id}>
                <Text style={[s.groupLabel, { color: colors.textMuted }]}>
                  {zone.label}
                </Text>
                {zone.cuts.map((cut) => (
                  <CutCard key={cut.name} cut={cut} colors={colors} />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CutCard({ cut, colors }: { cut: Cut; colors: any }) {
  return (
    <View
      style={[
        s.cutCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={s.cutHeader}>
        <Text style={[s.cutName, { color: colors.text }]}>{cut.name}</Text>
      </View>
      <View style={s.cutStats}>
        <View style={s.yieldWrap}>
          <Text style={[s.statLabel, { color: colors.textMuted }]}>Yield</Text>
          <Text style={[s.yieldValue, { color: yieldColor(cut.yieldPct) }]}>
            {cut.yieldPct}%
          </Text>
        </View>
        <View style={s.methodsWrap}>
          {cut.methods.map((m) => (
            <View
              key={m}
              style={[
                s.methodTag,
                {
                  backgroundColor:
                    (METHOD_COLORS[m] || "#6B7280") + "18",
                },
              ]}
            >
              <Text
                style={[
                  s.methodText,
                  { color: METHOD_COLORS[m] || "#6B7280" },
                ]}
              >
                {m}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  headerCount: { fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  // Chart
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  chartWrap: {
    width: IMAGE_W,
    height: IMAGE_H,
    position: "relative",
  },
  chartImage: {
    width: IMAGE_W,
    height: IMAGE_H,
  },
  tapZone: {
    position: "absolute",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  tapZoneActive: {
    backgroundColor: "rgba(22,163,74,0.15)",
  },

  hint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 16,
  },

  // Section bar
  sectionBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionAccent: {
    width: 4,
    height: "100%",
    backgroundColor: "#16A34A",
  },
  sectionInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionName: { fontSize: 16, fontWeight: "700" },
  sectionMeta: { fontSize: 12, marginTop: 2 },

  // Group label
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
    paddingLeft: 4,
  },

  // Cut cards
  cutCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  cutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cutName: { fontSize: 15, fontWeight: "600" },
  cutStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  yieldWrap: {
    alignItems: "center",
    minWidth: 44,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  yieldValue: { fontSize: 16, fontWeight: "800" },
  methodsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
  },
  methodTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  methodText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
