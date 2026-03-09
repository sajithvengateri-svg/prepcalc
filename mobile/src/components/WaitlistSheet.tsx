import React, { useState, useEffect } from "react";
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
import { X, Check, CheckCircle, Sparkles } from "lucide-react-native";
import { useAuth } from "../contexts/AuthProvider";
import { supabase } from "../lib/supabase";

const PRODUCTS = [
  {
    id: "prepmi_pro",
    name: "Prep Mi Pro",
    desc: "Full kitchen recipe costing, management & productivity",
    highlight: true,
  },
  {
    id: "prepmi_student",
    name: "Prep Mi Student",
    desc: "Built for student chefs & apprentices",
    highlight: false,
  },
  {
    id: "prepsafe",
    name: "PrepSafe",
    desc: "Food safety compliance, made easy",
    highlight: false,
  },
  {
    id: "prepmi_home",
    name: "Prep Mi Home",
    desc: "Get pro vibes — the ultimate kitchen help",
    highlight: false,
  },
];

interface WaitlistSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function WaitlistSheet({ visible, onDismiss }: WaitlistSheetProps) {
  const { user, profile, addCredits } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      Alert.alert("Pick at least one", "Tell us which products interest you.");
      return;
    }

    const email = profile?.email || user?.email;
    if (!email) {
      Alert.alert("Sign in first", "You need to be signed in to join the waitlist.");
      return;
    }

    setLoading(true);
    try {
      // Upsert into waitlist with product interests
      const { error } = await supabase.from("waitlist").upsert(
        {
          email,
          user_id: user?.id || null,
          source: "prepcam-cta",
          products_interested: selected,
          priority: selected.length >= 2, // multi-interest = high priority lead
        },
        { onConflict: "email" }
      );

      if (error) throw error;

      // Award 1 bonus credit for joining waitlist
      await addCredits(1);

      setDone(true);
    } catch (err: any) {
      Alert.alert("Oops", err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setSelected([]);
      setDone(false);
    }
  }, [visible]);

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

        {done ? (
          /* ---- SUCCESS ---- */
          <View style={s.successWrap}>
            <View style={s.successIcon}>
              <CheckCircle size={32} color="#16A34A" strokeWidth={2} />
            </View>
            <Text style={s.successTitle}>You're on the list!</Text>
            <Text style={s.successSub}>
              We'll notify you when{" "}
              {selected.length === 1
                ? PRODUCTS.find((p) => p.id === selected[0])?.name
                : "these products"}{" "}
              launch.
            </Text>
            <View style={s.creditBadge}>
              <Sparkles size={16} color="#D97706" strokeWidth={2} />
              <Text style={s.creditText}>+1 avatar credit earned!</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={s.doneBtn}>
              <Text style={s.doneBtnText}>Nice!</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ---- PRODUCT SELECT ---- */
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={s.title}>Join the Waitlist</Text>
            <Text style={s.subtitle}>
              Which products are you interested in?{"\n"}
              <Text style={s.subtitleBold}>Select all that apply</Text>
            </Text>

            <View style={s.products}>
              {PRODUCTS.map((product) => {
                const isSelected = selected.includes(product.id);
                return (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => toggle(product.id)}
                    activeOpacity={0.7}
                    style={[
                      s.productCard,
                      isSelected && s.productCardSelected,
                      product.highlight && !isSelected && s.productCardHighlight,
                    ]}
                  >
                    <View style={s.productRow}>
                      <View style={s.productInfo}>
                        <Text
                          style={[s.productName, isSelected && s.productNameSelected]}
                        >
                          {product.name}
                        </Text>
                        <Text style={s.productDesc}>{product.desc}</Text>
                      </View>
                      <View
                        pointerEvents="none"
                        style={[s.checkbox, isSelected && s.checkboxSelected]}
                      >
                        {isSelected && (
                          <Check size={16} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              style={[s.submitBtn, selected.length === 0 && s.submitBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={s.submitBtnText}>
                  Join Waitlist{selected.length > 0 ? ` (${selected.length})` : ""}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={s.footnote}>
              We'll email you when it's ready. No spam, ever.{"\n"}
              +1 free avatar credit for joining!
            </Text>
          </ScrollView>
        )}
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
    maxHeight: "85%",
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  subtitleBold: {
    fontWeight: "700",
    color: "#1A1A1A",
  },
  products: {
    gap: 10,
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  productCardSelected: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  productCardHighlight: {
    borderColor: "#BBF7D0",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  productNameSelected: {
    color: "#16A34A",
  },
  productDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  submitBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
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
  // Success state
  successWrap: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  creditText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D97706",
  },
  doneBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    marginTop: 20,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
