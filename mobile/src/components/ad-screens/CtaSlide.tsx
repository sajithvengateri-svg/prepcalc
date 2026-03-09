import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Camera } from "lucide-react-native";

export default function CtaSlide() {
  return (
    <View style={s.container}>
      <View style={s.logo}>
        <Camera size={28} color="#FFFFFF" strokeWidth={1.75} />
      </View>

      <Text style={s.headline}>Ready to run your kitchen?</Text>

      <View style={s.productCard}>
        <Text style={s.productName}>PrepSafe</Text>
        <Text style={s.productDesc}>Food safety compliance, made easy</Text>
      </View>

      <View style={s.productCard}>
        <Text style={s.productName}>Prep Mi Student</Text>
        <Text style={s.productDesc}>Built for student chefs</Text>
      </View>

      <View style={[s.productCard, { borderColor: "#16A34A", borderWidth: 1 }]}>
        <Text style={s.productName}>Prep Mi Pro</Text>
        <Text style={s.productDesc}>
          The full kitchen recipe costing, management & productivity app
        </Text>
      </View>

      <View style={s.ctaBtn}>
        <Text style={s.ctaBtnText}>Join the Waitlist</Text>
      </View>

      <Text style={s.counter}>2,847 chefs already in line</Text>
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
    borderRadius: 24,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headline: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  productCard: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  productDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
    lineHeight: 16,
  },
  ctaBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 16,
  },
  ctaBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  counter: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 10,
  },
});
