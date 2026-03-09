import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Camera } from "lucide-react-native";

export default function IntroSlide() {
  return (
    <View style={s.container}>
      <View style={s.logo}>
        <Camera size={40} color="#FFFFFF" strokeWidth={1.75} />
      </View>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  sub: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
