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

interface Allergen {
  name: string;
  color: string;
  bg: string;
  description: string;
  hiddenSources: string;
}

const ALLERGENS: Allergen[] = [
  {
    name: "Peanuts",
    color: "#FFFFFF",
    bg: "#DC2626",
    description:
      "A legume, not a tree nut. One of the most common causes of severe allergic reactions (anaphylaxis).",
    hiddenSources:
      "Satay sauce, pesto (some recipes), Asian dressings, cereal bars, praline, marzipan alternatives, arachis oil.",
  },
  {
    name: "Tree Nuts",
    color: "#FFFFFF",
    bg: "#DC2626",
    description:
      "Includes almonds, cashews, walnuts, hazelnuts, pistachios, pecans, macadamias, and Brazil nuts.",
    hiddenSources:
      "Nut oils, nougat, marzipan, praline, pesto, baklava, dukkah, frangelico, amaretto.",
  },
  {
    name: "Milk",
    color: "#FFFFFF",
    bg: "#D97706",
    description:
      "Refers to cow's milk protein. Lactose intolerance is different from a milk allergy.",
    hiddenSources:
      "Casein, whey, lactalbumin, ghee, butter, cream, custard, some margarines, protein powders.",
  },
  {
    name: "Eggs",
    color: "#FFFFFF",
    bg: "#D97706",
    description:
      "Both egg white and yolk can cause reactions. Egg white is the more common trigger.",
    hiddenSources:
      "Mayonnaise, meringue, pasta, battered foods, glazed pastry, quiche, some wines (fining agent).",
  },
  {
    name: "Wheat",
    color: "#FFFFFF",
    bg: "#D97706",
    description:
      "A cereal grain. Wheat allergy is different from coeliac disease (gluten intolerance).",
    hiddenSources:
      "Soy sauce, breadcrumbs, couscous, semolina, spelt, modified starch, malt vinegar, beer.",
  },
  {
    name: "Soy",
    color: "#FFFFFF",
    bg: "#3B82F6",
    description:
      "Derived from soybeans. Very widely used in processed and manufactured foods.",
    hiddenSources:
      "Soy lecithin, soybean oil, tofu, miso, tempeh, edamame, textured vegetable protein (TVP), some chocolates.",
  },
  {
    name: "Fish",
    color: "#FFFFFF",
    bg: "#3B82F6",
    description:
      "Covers all finned fish. Allergy can be to one or multiple species.",
    hiddenSources:
      "Worcestershire sauce, Caesar dressing, fish sauce, surimi, bouillabaisse, some Asian curry pastes.",
  },
  {
    name: "Shellfish",
    color: "#FFFFFF",
    bg: "#3B82F6",
    description:
      "Includes crustaceans (prawns, crab, lobster) and molluscs (mussels, oysters, squid).",
    hiddenSources:
      "Shrimp paste, oyster sauce, XO sauce, glucosamine supplements, some Thai / Vietnamese dishes.",
  },
  {
    name: "Sesame",
    color: "#FFFFFF",
    bg: "#6B7280",
    description:
      "Sesame seeds and sesame oil. Increasingly common allergen in Australia.",
    hiddenSources:
      "Tahini, hummus, halva, gomashio, some bread and burger buns, dukkah, Asian sauces.",
  },
  {
    name: "Lupin",
    color: "#FFFFFF",
    bg: "#6B7280",
    description:
      "A legume related to peanuts. Used as flour in some European and gluten-free baking.",
    hiddenSources:
      "Lupin flour, some gluten-free breads and pastas, continental European pastries and baked goods.",
  },
];

export default function AllergensScreen() {
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
          Allergens (Big 10)
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Australia's 10 major allergens that must be declared on food labels
          and menus.
        </Text>

        {ALLERGENS.map((allergen) => (
          <View
            key={allergen.name}
            style={[
              styles.allergenCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.allergenHeader}>
              <View
                style={[styles.allergenPill, { backgroundColor: allergen.bg }]}
              >
                <Text
                  style={[styles.allergenPillText, { color: allergen.color }]}
                >
                  {allergen.name}
                </Text>
              </View>
            </View>

            <Text style={[styles.description, { color: colors.text }]}>
              {allergen.description}
            </Text>

            <View
              style={[
                styles.hiddenSourcesBox,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[styles.hiddenSourcesLabel, { color: colors.textMuted }]}
              >
                Common hidden sources
              </Text>
              <Text
                style={[
                  styles.hiddenSourcesText,
                  { color: colors.textSecondary },
                ]}
              >
                {allergen.hiddenSources}
              </Text>
            </View>
          </View>
        ))}
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
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  allergenCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  allergenHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  allergenPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  allergenPillText: {
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  hiddenSourcesBox: {
    padding: 12,
    borderRadius: 10,
  },
  hiddenSourcesLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hiddenSourcesText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
