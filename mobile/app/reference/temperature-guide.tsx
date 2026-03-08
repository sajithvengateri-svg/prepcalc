import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

const ZONES = [
  {
    label: "Freezer",
    temp: "-18 degrees C or below",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    label: "Fridge",
    temp: "0 - 4 degrees C",
    color: "#06B6D4",
    bg: "#ECFEFF",
  },
  {
    label: "Danger Zone",
    temp: "5 - 60 degrees C",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  {
    label: "Hot Hold",
    temp: "60 degrees C+",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    label: "Cooking (Poultry)",
    temp: "75 degrees C",
    color: "#16A34A",
    bg: "#DCFCE7",
  },
  {
    label: "Reheating",
    temp: "75 degrees C",
    color: "#16A34A",
    bg: "#DCFCE7",
  },
];

export default function TemperatureGuideScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Temperature Guide
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {ZONES.map((zone) => (
          <View
            key={zone.label}
            style={[
              styles.zoneCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={[styles.indicator, { backgroundColor: zone.color }]} />
            <View style={styles.zoneContent}>
              <Text style={[styles.zoneLabel, { color: colors.text }]}>
                {zone.label}
              </Text>
              <View style={[styles.tempBadge, { backgroundColor: zone.bg }]}>
                <Text style={[styles.tempText, { color: zone.color }]}>
                  {zone.temp}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.noteTitle, { color: colors.text }]}>
            Key Points
          </Text>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {"\u2022"} Always check food temperature with a calibrated probe
            thermometer.
          </Text>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {"\u2022"} Measure at the thickest part of the food.
          </Text>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {"\u2022"} When reheating, food must reach 75 degrees C and be held
            for at least 2 minutes.
          </Text>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {"\u2022"} Cool cooked food from 60 degrees C to 21 degrees C within
            2 hours, then from 21 degrees C to 5 degrees C within a further
            4 hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  zoneCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  indicator: {
    width: 5,
    alignSelf: "stretch",
  },
  zoneContent: {
    flex: 1,
    padding: 16,
  },
  zoneLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  tempBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tempText: {
    fontSize: 13,
    fontWeight: "600",
  },
  noteCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
});
