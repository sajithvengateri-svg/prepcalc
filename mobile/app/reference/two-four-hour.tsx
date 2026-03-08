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

const RULES = [
  {
    time: "Under 2 hours",
    action: "Refrigerate or use immediately",
    color: "#16A34A",
    bg: "#DCFCE7",
  },
  {
    time: "2 - 4 hours",
    action: "Use immediately, do not refrigerate",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    time: "Over 4 hours",
    action: "Throw out",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
];

export default function TwoFourHourScreen() {
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
          2/4 Hour Rule
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {RULES.map((rule) => (
          <View
            key={rule.time}
            style={[
              styles.ruleCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={[styles.timeBadge, { backgroundColor: rule.bg }]}>
              <Text style={[styles.timeBadgeText, { color: rule.color }]}>
                {rule.time}
              </Text>
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>
              {rule.action}
            </Text>
          </View>
        ))}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            The Danger Zone
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            The danger zone refers to temperatures between 5 degrees C and 60
            degrees C. In this range, bacteria can grow rapidly in
            potentially hazardous food, doubling in number every 20 minutes.
          </Text>
          <Text
            style={[
              styles.infoText,
              { color: colors.textSecondary, marginTop: 12 },
            ]}
          >
            The 2/4 hour rule tells you how long freshly prepared
            potentially hazardous foods (foods that need to be kept below 5
            degrees C or above 60 degrees C) can safely be held at
            temperatures in the danger zone. This includes time the food is
            being prepared, served, and stored.
          </Text>
          <Text
            style={[
              styles.infoText,
              { color: colors.textSecondary, marginTop: 12 },
            ]}
          >
            The total time is cumulative -- that means you need to add up
            every time the food has been out of refrigeration, including
            prep, display, transport, and storage.
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
  ruleCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  timeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  timeBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
