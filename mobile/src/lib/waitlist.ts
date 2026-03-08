import { supabase } from "./supabase";

export async function joinWaitlist(email: string, referralCode?: string) {
  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      email,
      source: "prepcalc",
      referral_code: referralCode || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You're already on the waitlist!");
    }
    throw new Error(error.message);
  }

  return data;
}

export async function getWaitlistCount(): Promise<number> {
  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}

export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CHEF-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createReferralCode(email: string): Promise<string> {
  const code = generateReferralCode();

  const { error } = await supabase.from("referral_codes").insert({
    code,
    owner_email: email,
  });

  if (error) {
    // If code collision, try again
    if (error.code === "23505") {
      return createReferralCode(email);
    }
    throw new Error(error.message);
  }

  return code;
}

export async function useReferralCode(
  code: string,
  referredEmail: string
): Promise<boolean> {
  // Find the referral code
  const { data: codeData, error: findError } = await supabase
    .from("referral_codes")
    .select("id")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (findError || !codeData) return false;

  // Record the use
  await supabase.from("referral_uses").insert({
    code_id: codeData.id,
    referred_email: referredEmail,
  });

  // Increment usage count
  await supabase.rpc("increment_referral_count", { code_id: codeData.id });

  return true;
}
