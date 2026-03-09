import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";
import { ANIMAL_CHARTS } from "../../src/data/butcheryData";

export default function ButcheryChartsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

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
          Butchery Charts
        </Text>
        <View style={s.placeholder} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {ANIMAL_CHARTS.map((animal) => {
          const totalCuts = animal.zones.reduce(
            (sum, z) => sum + z.cuts.length,
            0
          );
          return (
            <TouchableOpacity
              key={animal.id}
              activeOpacity={0.7}
              onPress={() =>
                router.push(`/reference/butchery-detail?id=${animal.id}`)
              }
              style={[
                s.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Image
                source={animal.image}
                style={s.thumb}
                resizeMode="cover"
              />
              <View style={s.cardBody}>
                <Text style={[s.cardTitle, { color: colors.text }]}>
                  {animal.name}
                </Text>
                <Text style={[s.cardMeta, { color: colors.textSecondary }]}>
                  {animal.zones.length} primals · {totalCuts} cuts
                </Text>
              </View>
              <ChevronRight
                size={20}
                color={colors.textMuted}
                strokeWidth={2}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  placeholder: { width: 40 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  thumb: {
    width: 80,
    height: 56,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardMeta: { fontSize: 12, marginTop: 2 },
});
