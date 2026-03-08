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
import {
  Clock,
  Thermometer,
  Flame,
  Utensils,
  AlertTriangle,
} from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

const REFERENCE_CARDS = [
  {
    title: "2/4 Hour Rule",
    description: "Time & temperature safety guide",
    icon: Clock,
    route: "/reference/two-four-hour" as const,
  },
  {
    title: "Temperature Guide",
    description: "Safe cooking & storage temps",
    icon: Thermometer,
    route: "/reference/temperature-guide" as const,
  },
  {
    title: "Sous Vide Guide",
    description: "Time & temp for every protein",
    icon: Flame,
    route: "/reference/sous-vide" as const,
  },
  {
    title: "Butchery Charts",
    description: "Cuts, methods & yields",
    icon: Utensils,
    route: "/reference/butchery-charts" as const,
  },
  {
    title: "Allergens (Big 10)",
    description: "Australia's major allergens",
    icon: AlertTriangle,
    route: "/reference/allergens" as const,
  },
];

export default function ReferenceScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Reference</Text>

        {REFERENCE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <TouchableOpacity
              key={card.title}
              activeOpacity={0.7}
              onPress={() => router.push(card.route)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View
                style={[styles.iconWrap, { backgroundColor: colors.accentBg }]}
              >
                <Icon size={22} color={colors.accent} strokeWidth={2} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {card.title}
                </Text>
                <Text
                  style={[
                    styles.cardDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {card.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
  },
});
