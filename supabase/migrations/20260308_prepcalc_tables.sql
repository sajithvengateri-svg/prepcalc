-- PrepCalc v1: Waitlist, referrals, anime purchases, AI usage

-- Waitlist signups
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID,
  source TEXT DEFAULT 'prepcalc',
  referral_code TEXT,
  priority BOOLEAN DEFAULT false,
  discount_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can join waitlist)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read their own entry
CREATE POLICY "Users can read own waitlist entry"
  ON public.waitlist FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Referral codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  owner_user_id UUID,
  owner_email TEXT,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active referral codes"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can insert referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can update own codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- Referral uses
CREATE TABLE IF NOT EXISTS public.referral_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID REFERENCES public.referral_codes(id),
  referred_user_id UUID,
  referred_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert referral uses"
  ON public.referral_uses FOR INSERT
  WITH CHECK (true);

-- Anime avatar purchases
CREATE TABLE IF NOT EXISTS public.anime_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  style TEXT NOT NULL,
  receipt_id TEXT,
  amount NUMERIC DEFAULT 1.00,
  currency TEXT DEFAULT 'AUD',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anime_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert anime purchases"
  ON public.anime_purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own purchases"
  ON public.anime_purchases FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- AI usage tracking
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  feature TEXT NOT NULL,
  tokens_in INTEGER,
  tokens_out INTEGER,
  estimated_cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ai_usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
