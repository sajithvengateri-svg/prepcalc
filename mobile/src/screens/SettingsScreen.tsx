import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme, THEMES } from "../contexts/ThemeProvider";

export default function SettingsScreen() {
  const { themeId, colors, setTheme } = useTheme();
  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.background }]} contentContainerStyle={s.content}>
      {/* Header */}
      <Text style={[s.title, { color: colors.text }]}>Settings</Text>
      <Text style={[s.subtitle, { color: colors.textMuted }]}>Customize your experience</Text>

      {/* Theme Section */}
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>THEME</Text>
      <View style={s.themeGrid}>
        {THEMES.map((theme) => {
          const active = themeId === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              onPress={() => { tap(); setTheme(theme.id); }}
              style={[
                s.themeCard,
                {
                  backgroundColor: colors.card,
                  borderColor: active ? colors.accent : colors.cardBorder,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              {active && (
                <View style={[s.checkBadge, { backgroundColor: colors.accent }]}>
                  <Text style={s.checkIcon}>✓</Text>
                </View>
              )}
              <View style={s.swatchRow}>
                {theme.swatches.map((color, i) => (
                  <View key={i} style={[s.swatch, { backgroundColor: color }]} />
                ))}
              </View>
              <Text style={[s.themeLabel, { color: colors.text }]}>{theme.label}</Text>
              <Text style={[s.themeDesc, { color: colors.textMuted }]}>{theme.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* About Section */}
      <Text style={[s.sectionTitle, { color: colors.textMuted }]}>ABOUT</Text>
      <View style={[s.aboutCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[s.aboutRow, { borderBottomColor: colors.border }]}>
          <Text style={[s.aboutLabel, { color: colors.text }]}>Version</Text>
          <Text style={[s.aboutValue, { color: colors.textMuted }]}>1.0.0</Text>
        </View>
        <View style={[s.aboutRow, { borderBottomColor: colors.border }]}>
          <Text style={[s.aboutLabel, { color: colors.text }]}>Built by</Text>
          <Text style={[s.aboutValue, { color: colors.textMuted }]}>ChefOS Team</Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://chefos.ai")}
          style={s.aboutRow}
        >
          <Text style={[s.aboutLabel, { color: colors.text }]}>Website</Text>
          <Text style={[s.aboutLink, { color: colors.accent }]}>chefos.ai</Text>
        </TouchableOpacity>
      </View>

      <Text style={[s.footer, { color: colors.textMuted }]}>
        Built for chefs & restaurant owners
      </Text>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 8 },
  subtitle: { fontSize: 14, marginTop: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, marginBottom: 10, marginTop: 8 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  themeCard: { width: "48%", padding: 16, borderRadius: 16, position: "relative" },
  checkBadge: { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  checkIcon: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  swatchRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  swatch: { width: 24, height: 24, borderRadius: 12 },
  themeLabel: { fontSize: 14, fontWeight: "700" },
  themeDesc: { fontSize: 12, marginTop: 2 },
  aboutCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
  aboutRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: "500" },
  aboutLink: { fontSize: 14, fontWeight: "600" },
  footer: { textAlign: "center", fontSize: 12, marginTop: 8 },
});
