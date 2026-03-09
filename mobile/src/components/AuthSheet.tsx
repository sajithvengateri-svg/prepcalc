import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Lock, Mail, CheckCircle } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeProvider";
import { useAuth } from "../contexts/AuthProvider";
import { supabase } from "../lib/supabase";

interface AuthSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export default function AuthSheet({ visible, onDismiss, onSuccess }: AuthSheetProps) {
  const { colors } = useTheme();
  const { signInWithApple, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isSignIn, setIsSignIn] = useState(false); // false = create account, true = sign in
  const [confirmationSent, setConfirmationSent] = useState(false); // show "check email" screen

  const handleApple = async () => {
    setLoading(true);
    const ok = await signInWithApple();
    setLoading(false);
    if (ok) onSuccess();
  };

  const handleGoogle = async () => {
    setLoading(true);
    const ok = await signInWithGoogle();
    setLoading(false);
    if (ok) onSuccess();
  };

  const handleEmailAuth = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert("Missing Fields", "Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password Too Short", "Minimum 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isSignIn) {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
      } else {
        // Create new account
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              source: "prepcalc",
              ...(referralCode.trim() ? { referred_by: referralCode.trim().toUpperCase() } : {}),
            },
          },
        });
        if (error) throw error;

        // Supabase returns a fake user with no session when email already exists
        // (to prevent email enumeration). Detect and redirect to sign-in.
        if (data?.user && !data.session) {
          setLoading(false);
          Alert.alert(
            "Account Exists",
            "This email is already registered. Tap OK to sign in.",
            [{ text: "OK", onPress: () => setIsSignIn(true) }]
          );
          return;
        }

        // Also catch: identities array is empty = email exists (another Supabase signal)
        if (data?.user?.identities && data.user.identities.length === 0) {
          setLoading(false);
          Alert.alert(
            "Account Exists",
            "This email is already registered. Tap OK to sign in.",
            [{ text: "OK", onPress: () => setIsSignIn(true) }]
          );
          return;
        }

        // Email confirmation required — show "check your email" screen
        setLoading(false);
        setConfirmationSent(true);
        return;
      }
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      Alert.alert(
        isSignIn ? "Sign In Failed" : "Signup Failed",
        err.message || "Something went wrong."
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <TouchableOpacity
          style={st.overlay}
          activeOpacity={1}
          onPress={onDismiss}
        />
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[st.sheet, { backgroundColor: colors.card }]}
        >
          {/* Handle */}
          <View style={[st.handle, { backgroundColor: colors.border }]} />

          {confirmationSent ? (
            /* ---- CHECK YOUR EMAIL SCREEN ---- */
            <>
              <View style={[st.lockCircle, { backgroundColor: "#DCFCE7" }]}>
                <Mail size={24} color="#16A34A" strokeWidth={2} />
              </View>

              <Text style={[st.title, { color: colors.text }]}>
                Check your email
              </Text>

              <Text style={[st.confirmText, { color: colors.textMuted }]}>
                We sent a confirmation link to{"\n"}
                <Text style={{ fontWeight: "700", color: colors.text }}>{email}</Text>
                {"\n\n"}Tap the link in the email, then come back and sign in.
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setConfirmationSent(false);
                  setIsSignIn(true);
                }}
                style={[st.emailBtn, { backgroundColor: colors.accent, marginTop: 20, width: "100%" }]}
              >
                <Text style={st.emailBtnText}>I've Confirmed — Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  const trimmedEmail = email.trim().toLowerCase();
                  const { error } = await supabase.auth.resend({
                    type: "signup",
                    email: trimmedEmail,
                  });
                  if (error) {
                    Alert.alert("Resend Failed", error.message);
                  } else {
                    Alert.alert("Sent", "Confirmation email resent.");
                  }
                }}
                style={st.toggleRow}
              >
                <Text style={[st.toggleText, { color: colors.textMuted }]}>
                  {"Didn't get it? "}
                </Text>
                <Text style={[st.toggleLink, { color: colors.accent }]}>
                  Resend Email
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ---- MAIN AUTH SCREEN ---- */
            <>
              {/* Lock icon */}
              <View style={[st.lockCircle, { backgroundColor: colors.accentBg }]}>
                <Lock size={24} color={colors.accent} strokeWidth={2} />
              </View>

              <Text style={[st.title, { color: colors.text }]}>
                Sign in to create your{"\n"}Anime Chef Avatar
              </Text>

              {loading ? (
                <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 24 }} />
              ) : (
                <>
                  {/* Social auth buttons */}
                  <View style={st.buttons}>
                    {Platform.OS === "ios" && (
                      <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={14}
                        style={st.socialBtn}
                        onPress={handleApple}
                      />
                    )}
                    <TouchableOpacity
                      onPress={handleGoogle}
                      style={[st.googleBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[st.googleBtnText, { color: colors.text }]}>
                        Sign in with Google
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View style={st.dividerRow}>
                    <View style={[st.dividerLine, { backgroundColor: colors.border }]} />
                    <Text style={[st.dividerText, { color: colors.textMuted }]}>or</Text>
                    <View style={[st.dividerLine, { backgroundColor: colors.border }]} />
                  </View>

                  {/* Email / Password */}
                  <View style={st.fields}>
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      style={[
                        st.input,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      textContentType={isSignIn ? "password" : "newPassword"}
                      style={[
                        st.input,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                    {!isSignIn && (
                      <TextInput
                        placeholder="Got a referral code? (optional)"
                        placeholderTextColor={colors.textMuted}
                        value={referralCode}
                        onChangeText={setReferralCode}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        style={[
                          st.input,
                          {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.border,
                            color: colors.text,
                          },
                        ]}
                      />
                    )}
                    <TouchableOpacity
                      onPress={handleEmailAuth}
                      style={[st.emailBtn, { backgroundColor: colors.accent }]}
                    >
                      <Text style={st.emailBtnText}>
                        {isSignIn ? "Sign In" : "Create Account"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Toggle sign in / create */}
                  <TouchableOpacity onPress={() => setIsSignIn(!isSignIn)} style={st.toggleRow}>
                    <Text style={[st.toggleText, { color: colors.textMuted }]}>
                      {isSignIn ? "Don't have an account? " : "Already have one? "}
                    </Text>
                    <Text style={[st.toggleLink, { color: colors.accent }]}>
                      {isSignIn ? "Create Account" : "Sign In"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={[st.footnote, { color: colors.textMuted }]}>
                One tap. 3 free avatars waiting.
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  lockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 20,
  },
  buttons: {
    width: "100%",
    gap: 10,
  },
  socialBtn: {
    width: "100%",
    height: 50,
  },
  googleBtn: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    marginHorizontal: 12,
  },
  // Email fields
  fields: {
    width: "100%",
    gap: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  emailBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emailBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // Toggle
  toggleRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  toggleText: {
    fontSize: 13,
  },
  toggleLink: {
    fontSize: 13,
    fontWeight: "700",
  },
  confirmText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  footnote: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 16,
  },
});
