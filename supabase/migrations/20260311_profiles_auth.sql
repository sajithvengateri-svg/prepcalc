-- Add avatar_credits and referral_code to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_credits INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Update the auto-create trigger to include avatar_credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_credits)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 3);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
