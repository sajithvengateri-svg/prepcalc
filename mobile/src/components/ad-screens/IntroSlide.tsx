import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shield } from "lucide-react-native";

export default function IntroSlide() {
  return (
    <View style={s.container}>
      <View style={s.logo}>
        <Shield size={28} color="#FFFFFF" strokeWidth={2} fill="#16A34A" />
      </View>
      <Text style={s.brand}>Prep Mi</Text>
      <View style={s.gap} />
      <Text style={s.headline}>Built by chefs, for chefs</Text>
      <Text style={s.sub}>The ultimate kitchen{"\n"}productivity app</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  gap: {
    height: 20,
  },
  headline: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  sub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
