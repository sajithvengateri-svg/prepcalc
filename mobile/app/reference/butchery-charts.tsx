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
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeProvider";

interface CutInfo {
  name: string;
  location: string;
  methods: string;
  notes?: string;
}

interface AnimalData {
  animal: string;
  cuts: CutInfo[];
}

const ANIMALS: AnimalData[] = [
  {
    animal: "Beef",
    cuts: [
      { name: "Chuck", location: "Shoulder", methods: "Braising, stewing" },
      { name: "Rib", location: "Back", methods: "Roasting, grilling" },
      { name: "Short Loin", location: "Back", methods: "Grilling, pan-frying" },
      { name: "Sirloin", location: "Hip", methods: "Grilling, roasting" },
      { name: "Round", location: "Rear leg", methods: "Braising, roasting" },
      { name: "Brisket", location: "Chest", methods: "Smoking, braising" },
      { name: "Plate", location: "Belly", methods: "Braising, stewing" },
      { name: "Flank", location: "Belly", methods: "Grilling, stir-fry" },
      { name: "Shank", location: "Leg", methods: "Braising, stewing" },
    ],
  },
  {
    animal: "Lamb",
    cuts: [
      { name: "Shoulder", location: "Front", methods: "Braising, roasting" },
      { name: "Rack", location: "Back", methods: "Roasting, grilling" },
      { name: "Loin", location: "Back", methods: "Grilling, pan-frying" },
      { name: "Leg", location: "Rear", methods: "Roasting, braising" },
      { name: "Breast", location: "Chest", methods: "Braising, rolling" },
      { name: "Shank", location: "Leg", methods: "Braising, stewing" },
    ],
  },
  {
    animal: "Pork",
    cuts: [
      {
        name: "Shoulder / Butt",
        location: "Front",
        methods: "Braising, pulling",
      },
      { name: "Loin", location: "Back", methods: "Roasting, grilling" },
      { name: "Belly", location: "Underside", methods: "Roasting, braising" },
      { name: "Leg / Ham", location: "Rear", methods: "Roasting, curing" },
      { name: "Ribs", location: "Side", methods: "Smoking, grilling" },
      {
        name: "Tenderloin",
        location: "Back",
        methods: "Pan-frying, roasting",
      },
    ],
  },
  {
    animal: "Chicken",
    cuts: [
      { name: "Breast", location: "Front", methods: "Grilling, poaching" },
      { name: "Thigh", location: "Leg", methods: "Braising, grilling" },
      { name: "Drumstick", location: "Leg", methods: "Roasting, frying" },
      { name: "Wing", location: "Side", methods: "Frying, grilling" },
      {
        name: "Maryland",
        location: "Leg + thigh",
        methods: "Roasting",
      },
      {
        name: "Supreme",
        location: "Breast + wing bone",
        methods: "Pan-frying",
      },
      { name: "Oyster", location: "Back", methods: "Pan-frying" },
    ],
  },
  {
    animal: "Fish",
    cuts: [
      { name: "Whole", location: "Complete", methods: "Roasting, steaming" },
      { name: "Fillet", location: "Side", methods: "Pan-frying, baking" },
      {
        name: "Darne / Steak",
        location: "Cross-cut",
        methods: "Grilling, poaching",
      },
      {
        name: "Supreme",
        location: "Thick boneless",
        methods: "Pan-frying",
      },
      { name: "Goujon", location: "Strip", methods: "Deep-frying" },
      {
        name: "Paupiette",
        location: "Rolled fillet",
        methods: "Poaching, baking",
      },
    ],
  },
];

export default function ButcheryChartsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Beef: true,
  });

  const toggle = (animal: string) => {
    setExpanded((prev) => ({ ...prev, [animal]: !prev[animal] }));
  };

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
          Butchery Charts
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {ANIMALS.map((animal) => {
          const isOpen = !!expanded[animal.animal];
          return (
            <View
              key={animal.animal}
              style={[
                styles.animalCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggle(animal.animal)}
                style={styles.animalHeader}
              >
                <Text style={[styles.animalTitle, { color: colors.text }]}>
                  {animal.animal}
                </Text>
                <View style={styles.animalMeta}>
                  <Text
                    style={[
                      styles.cutCount,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {animal.cuts.length} cuts
                  </Text>
                  {isOpen ? (
                    <ChevronDown
                      size={20}
                      color={colors.textMuted}
                      strokeWidth={2}
                    />
                  ) : (
                    <ChevronRight
                      size={20}
                      color={colors.textMuted}
                      strokeWidth={2}
                    />
                  )}
                </View>
              </TouchableOpacity>

              {isOpen &&
                animal.cuts.map((cut, i) => (
                  <View
                    key={cut.name}
                    style={[
                      styles.cutRow,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                      },
                    ]}
                  >
                    <Text style={[styles.cutName, { color: colors.text }]}>
                      {cut.name}
                    </Text>
                    <View style={styles.cutDetails}>
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            { color: colors.textMuted },
                          ]}
                        >
                          Location
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {cut.location}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            { color: colors.textMuted },
                          ]}
                        >
                          Methods
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {cut.methods}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
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
  animalCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  animalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  animalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  animalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cutCount: {
    fontSize: 13,
  },
  cutRow: {
    padding: 14,
    paddingLeft: 16,
  },
  cutName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  cutDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    width: 70,
  },
  detailValue: {
    fontSize: 13,
    flex: 1,
  },
});
