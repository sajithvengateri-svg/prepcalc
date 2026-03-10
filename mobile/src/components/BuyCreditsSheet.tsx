import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useStripe } from "@stripe/stripe-react-native";
import { X, Zap, Check, Star } from "lucide-react-native";
import { useAuth } from "../contexts/AuthProvider";
import { supabase } from "../lib/supabase";

const PACKS = [
  {
    id: "pack_3",
    credits: 3,
    price: "$2.99",
    pricePerUnit: "$1.00/ea",
    popular: false,
  },
  {
    id: "pack_10",
    credits: 10,
    price: "$7.99",
    pricePerUnit: "$0.80/ea",
    popular: true,
  },
  {
    id: "pack_25",
    credits: 25,
    price: "$14.99",
    pricePerUnit: "$0.60/ea",
    popular: false,
  },
];

interface BuyCreditsSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export default function BuyCreditsSheet({ visible, onDismiss, onSuccess }: BuyCreditsSheetProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedPack, setSelectedPack] = useState("pack_10");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert("Sign in first", "You need to be signed in to buy credits.");
      return;
    }

    setLoading(true);
    try {
      // Get payment intent from our edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(
        "https://twxysmsntweutblkfzdi.supabase.co/functions/v1/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pack_id: selectedPack }),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Initialize and present Stripe payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: result.clientSecret,
        merchantDisplayName: "PrepCam",
        defaultBillingDetails: {
          email: profile?.email || user.email,
        },
      });

      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === "Canceled") {
          setLoading(false);
          return;
        }
        throw new Error(presentError.message);
      }

      // Payment succeeded — refresh profile to get updated credits
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refreshProfile();

      Alert.alert(
        "Credits Added!",
        `${PACKS.find((p) => p.id === selectedPack)?.credits} avatar credits have been added to your account.`,
        [{ text: "Nice!", onPress: () => { onSuccess(); onDismiss(); } }]
      );
    } catch (err: any) {
      Alert.alert("Payment Failed", err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onDismiss} />
      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        {/* Close */}
        <TouchableOpacity onPress={onDismiss} style={s.closeBtn}>
          <X size={20} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <View style={s.iconCircle}>
              <Zap size={28} color="#7C3AED" strokeWidth={2} />
            </View>
            <Text style={s.title}>Get More Avatars</Text>
            <Text style={s.subtitle}>
              You have{" "}
              <Text style={s.creditCount}>{profile?.avatarCredits ?? 0}</Text>{" "}
              credit{(profile?.avatarCredits ?? 0) !== 1 ? "s" : ""} remaining
            </Text>
          </View>

          {/* Pack selection */}
          <View style={s.packs}>
            {PACKS.map((pack) => {
              const isSelected = selectedPack === pack.id;
              return (
                <TouchableOpacity
                  key={pack.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPack(pack.id);
                  }}
                  activeOpacity={0.7}
                  style={[
                    s.packCard,
                    isSelected && s.packCardSelected,
                    pack.popular && !isSelected && s.packCardPopular,
                  ]}
                >
                  {pack.popular && (
                    <View style={s.popularBadge}>
                      <Star size={10} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                      <Text style={s.popularText}>Best Value</Text>
                    </View>
                  )}
                  <View style={s.packRow}>
                    <View style={s.packInfo}>
                      <Text style={[s.packCredits, isSelected && s.packCreditsSelected]}>
                        {pack.credits} Avatars
                      </Text>
                      <Text style={s.packPerUnit}>{pack.pricePerUnit}</Text>
                    </View>
                    <View style={s.packRight}>
                      <Text style={[s.packPrice, isSelected && s.packPriceSelected]}>
                        {pack.price}
                      </Text>
                      <View
                        pointerEvents="none"
                        style={[s.radio, isSelected && s.radioSelected]}
                      >
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Buy button */}
          <TouchableOpacity
            onPress={handlePurchase}
            activeOpacity={0.8}
            style={s.buyBtn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={s.buyBtnText}>
                Buy {PACKS.find((p) => p.id === selectedPack)?.credits} Avatars —{" "}
                {PACKS.find((p) => p.id === selectedPack)?.price}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={s.footnote}>
            Secure payment via Stripe. Credits never expire.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#FAFAF8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "80%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  creditCount: {
    fontWeight: "700",
    color: "#7C3AED",
  },
  packs: {
    gap: 10,
    marginBottom: 20,
  },
  packCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  packCardSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "#FAF5FF",
  },
  packCardPopular: {
    borderColor: "#DDD6FE",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#7C3AED",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  packRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packInfo: {
    flex: 1,
  },
  packCredits: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  packCreditsSelected: {
    color: "#7C3AED",
  },
  packPerUnit: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  packRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  packPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  packPriceSelected: {
    color: "#7C3AED",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  buyBtn: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footnote: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
});
