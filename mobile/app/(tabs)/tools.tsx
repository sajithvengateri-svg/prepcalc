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
  ArrowUpDown,
  ArrowLeftRight,
  Clock,
  DollarSign,
  Percent,
} from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

interface ToolItem {
  title: string;
  description: string;
  route: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const TOOLS: ToolItem[] = [
  {
    title: "Recipe Scaler",
    description: "Scale any recipe",
    route: "/tools/recipe-scaler",
    Icon: ArrowUpDown,
    iconColor: "#16A34A",
    iconBg: "#DCFCE7",
  },
  {
    title: "Unit Converter",
    description: "g, oz, ml, cups",
    route: "/tools/unit-converter",
    Icon: ArrowLeftRight,
    iconColor: "#2563EB",
    iconBg: "#DBEAFE",
  },
  {
    title: "Multi Timer",
    description: "Run 5 at once",
    route: "/tools/multi-timer",
    Icon: Clock,
    iconColor: "#D97706",
    iconBg: "#FEF3C7",
  },
  {
    title: "Cost / Portion",
    description: "Know your margins",
    route: "/tools/cost-portion",
    Icon: DollarSign,
    iconColor: "#DB2777",
    iconBg: "#FCE7F3",
  },
  {
    title: "Yield Calculator",
    description: "Whole to usable %",
    route: "/tools/yield-calculator",
    Icon: Percent,
    iconColor: "#4F46E5",
    iconBg: "#E0E7FF",
  },
];

export default function ToolsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tools</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Kitchen essentials at your fingertips
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.route}
            activeOpacity={0.7}
            onPress={() => router.push(tool.route as any)}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: tool.iconBg }]}>
              <tool.Icon size={22} color={tool.iconColor} strokeWidth={2} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {tool.title}
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                {tool.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    marginLeft: 14,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});
