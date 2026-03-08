import React, { useState } from "react";
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

type Protein = "Beef" | "Chicken" | "Pork" | "Fish" | "Eggs" | "Lamb";

interface SousVideEntry {
  cut: string;
  temp: string;
  time: string;
}

const DATA: Record<Protein, SousVideEntry[]> = {
  Beef: [
    { cut: "Ribeye (rare)", temp: "54\u00B0C", time: "1-2 hr" },
    { cut: "Ribeye (medium)", temp: "58\u00B0C", time: "1-2 hr" },
    { cut: "Tenderloin", temp: "54\u00B0C", time: "1-2 hr" },
    { cut: "Short Ribs", temp: "68\u00B0C", time: "24-48 hr" },
    { cut: "Brisket", temp: "68\u00B0C", time: "24-36 hr" },
    { cut: "Burger", temp: "58\u00B0C", time: "1-2 hr" },
    { cut: "Chuck Roast", temp: "60\u00B0C", time: "24 hr" },
  ],
  Chicken: [
    { cut: "Breast", temp: "65\u00B0C", time: "1-2 hr" },
    { cut: "Thigh", temp: "74\u00B0C", time: "1-4 hr" },
    { cut: "Whole Leg", temp: "74\u00B0C", time: "4 hr" },
    { cut: "Wings", temp: "65\u00B0C", time: "2 hr" },
  ],
  Pork: [
    { cut: "Chop", temp: "60\u00B0C", time: "1-2 hr" },
    { cut: "Tenderloin", temp: "60\u00B0C", time: "1-2 hr" },
    { cut: "Belly", temp: "77\u00B0C", time: "8-12 hr" },
    { cut: "Ribs", temp: "68\u00B0C", time: "12-24 hr" },
    { cut: "Shoulder", temp: "68\u00B0C", time: "18-24 hr" },
  ],
  Fish: [
    { cut: "Salmon", temp: "52\u00B0C", time: "30-45 min" },
    { cut: "Cod", temp: "56\u00B0C", time: "30-45 min" },
    { cut: "Halibut", temp: "52\u00B0C", time: "30-45 min" },
    { cut: "Prawns", temp: "60\u00B0C", time: "20-30 min" },
    { cut: "Lobster Tail", temp: "60\u00B0C", time: "45 min" },
  ],
  Eggs: [
    { cut: "Soft Poached", temp: "64\u00B0C", time: "45 min" },
    { cut: "Medium", temp: "68\u00B0C", time: "45 min" },
    { cut: "Hard", temp: "75\u00B0C", time: "45 min" },
    { cut: "Onsen", temp: "63\u00B0C", time: "1 hr" },
  ],
  Lamb: [
    { cut: "Rack (rare)", temp: "55\u00B0C", time: "1-2 hr" },
    { cut: "Leg", temp: "58\u00B0C", time: "8-12 hr" },
    { cut: "Shoulder", temp: "68\u00B0C", time: "24 hr" },
    { cut: "Shanks", temp: "68\u00B0C", time: "24 hr" },
  ],
};

const PROTEINS: Protein[] = ["Beef", "Chicken", "Pork", "Fish", "Eggs", "Lamb"];

export default function SousVideScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<Protein>("Beef");

  const entries = DATA[selected];

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
          Sous Vide Guide
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {PROTEINS.map((protein) => {
          const isActive = protein === selected;
          return (
            <TouchableOpacity
              key={protein}
              activeOpacity={0.7}
              onPress={() => setSelected(protein)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.accent : colors.card,
                  borderColor: isActive ? colors.accent : colors.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isActive ? "#FFFFFF" : colors.textSecondary },
                ]}
              >
                {protein}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.table,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View
            style={[styles.tableHeader, { borderBottomColor: colors.border }]}
          >
            <Text
              style={[styles.thText, styles.cutCol, { color: colors.textMuted }]}
            >
              Cut
            </Text>
            <Text
              style={[styles.thText, styles.tempCol, { color: colors.textMuted }]}
            >
              Temp
            </Text>
            <Text
              style={[
                styles.thText,
                styles.timeCol,
                { color: colors.textMuted },
              ]}
            >
              Time
            </Text>
          </View>

          {entries.map((entry, i) => (
            <View
              key={entry.cut}
              style={[
                styles.tableRow,
                i < entries.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.cellText, styles.cutCol, { color: colors.text }]}
              >
                {entry.cut}
              </Text>
              <Text
                style={[
                  styles.cellText,
                  styles.tempCol,
                  { color: colors.accent },
                ]}
              >
                {entry.temp}
              </Text>
              <Text
                style={[
                  styles.cellText,
                  styles.timeCol,
                  { color: colors.textSecondary },
                ]}
              >
                {entry.time}
              </Text>
            </View>
          ))}
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
  pillScroll: {
    flexGrow: 0,
  },
  pillRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  table: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  thText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  cellText: {
    fontSize: 14,
  },
  cutCol: {
    flex: 2,
  },
  tempCol: {
    flex: 1,
    textAlign: "center",
  },
  timeCol: {
    flex: 1.2,
    textAlign: "right",
  },
});
