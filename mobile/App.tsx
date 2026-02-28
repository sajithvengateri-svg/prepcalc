import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeProvider";
import CalculatorScreen from "./src/screens/CalculatorScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

type Tab = "calculator" | "settings";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Screen Content */}
      <View style={s.screen}>
        {activeTab === "calculator" ? <CalculatorScreen /> : <SettingsScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[s.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder }]}>
        <TabButton
          label="Calculator"
          active={activeTab === "calculator"}
          onPress={() => setActiveTab("calculator")}
          colors={colors}
        />
        <TabButton
          label="Settings"
          active={activeTab === "settings"}
          onPress={() => setActiveTab("settings")}
          colors={colors}
        />
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress, colors }: {
  label: string; active: boolean; onPress: () => void; colors: any;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={s.tabBtn}>
      <Text style={[
        s.tabIcon,
        { color: active ? colors.accent : colors.textMuted },
      ]}>
        {label === "Calculator" ? "⊞" : "⚙"}
      </Text>
      <Text style={[
        s.tabLabel,
        {
          color: active ? colors.accent : colors.textMuted,
          fontWeight: active ? "700" : "500",
        },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === "android" ? 30 : 0 },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    height: Platform.OS === "ios" ? 80 : 64,
  },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 11 },
});
