import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Platform, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { supabase } from "../lib/supabase";
import { createReferralCode } from "../lib/waitlist";
import type { Session, User } from "@supabase/supabase-js";

export interface UserProfile {
  displayName: string;
  email: string;
  avatarCredits: number;
  referralCode: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signInWithApple: () => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  useAvatarCredit: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signInWithApple: async () => false,
  signInWithGoogle: async () => false,
  signOut: async () => {},
  refreshProfile: async () => {},
  useAvatarCredit: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load or create user profile from Supabase
  const loadProfile = useCallback(async (user: User) => {
    try {
      // Get or create profile
      const { data: existing } = await supabase
        .from("profiles")
        .select("display_name, avatar_credits, referral_code")
        .eq("id", user.id)
        .single();

      if (existing) {
        setProfile({
          displayName: existing.display_name || user.user_metadata?.full_name || "Chef",
          email: user.email || "",
          avatarCredits: existing.avatar_credits ?? 3,
          referralCode: existing.referral_code,
        });
        return;
      }

      // First sign-in: create profile + referral code + waitlist entry
      const displayName = user.user_metadata?.full_name || "Chef";
      const email = user.email || "";
      let referralCode: string | null = null;

      try {
        referralCode = await createReferralCode(email);
      } catch {
        // Non-critical
      }

      // Create profile
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName,
        avatar_credits: 3,
        referral_code: referralCode,
      });

      // Auto-enroll in waitlist
      await supabase.from("waitlist").upsert(
        { email, user_id: user.id, source: "prepcalc-auth", priority: false },
        { onConflict: "email" }
      );

      setProfile({
        displayName,
        email,
        avatarCredits: 3,
        referralCode,
      });
    } catch (err) {
      // Fallback profile from user metadata
      setProfile({
        displayName: user.user_metadata?.full_name || "Chef",
        email: user.email || "",
        avatarCredits: 3,
        referralCode: null,
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  // Apple Sign In (native)
  const signInWithApple = useCallback(async (): Promise<boolean> => {
    try {
      const rawNonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        throw new Error("No identity token from Apple");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) throw error;
      return true;
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") return false;
      Alert.alert("Sign In Failed", err.message || "Could not sign in with Apple.");
      return false;
    }
  }, []);

  // Google Sign In (via Supabase OAuth — opens browser)
  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "prepcalc://auth/callback",
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const WebBrowser = await import("expo-web-browser");
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          "prepcalc://auth/callback"
        );

        if (result.type === "success" && result.url) {
          // Extract tokens from URL fragment
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.slice(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            return true;
          }
        }
      }
      return false;
    } catch (err: any) {
      if (err.message?.includes("cancel")) return false;
      Alert.alert("Sign In Failed", err.message || "Could not sign in with Google.");
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const useAvatarCredit = useCallback(async (): Promise<boolean> => {
    if (!user || !profile) return false;
    if (profile.avatarCredits <= 0) return false;

    const newCredits = profile.avatarCredits - 1;
    await supabase
      .from("profiles")
      .update({ avatar_credits: newCredits })
      .eq("id", user.id);

    setProfile((prev) => prev ? { ...prev, avatarCredits: newCredits } : prev);
    return true;
  }, [user, profile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signInWithApple,
        signInWithGoogle,
        signOut,
        refreshProfile,
        useAvatarCredit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
