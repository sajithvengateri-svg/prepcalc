import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function IntroSlide() {
  return (
    <View style={s.container}>
      <Image
        source={require("../../../assets/images/logo-prepmi.png")}
        style={s.logo}
        resizeMode="contain"
      />
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
    backgroundColor: "#FAFAF8",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 12,
  },
  brand: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
  },
  gap: {
    height: 20,
  },
  headline: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
  },
  sub: {
    fontSize: 13,
    color: "rgba(0,0,0,0.4)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
