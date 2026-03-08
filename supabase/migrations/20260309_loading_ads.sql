-- Loading Ads system for PrepCalc
-- Tables: loading_ads, ad_schedule, ad_impressions

-- Main ads table
CREATE TABLE IF NOT EXISTS loading_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  cta_text TEXT NOT NULL DEFAULT 'Coming Soon',
  cta_url TEXT,
  screen_preset TEXT NOT NULL CHECK (screen_preset IN (
    'dashboard', 'recipe_costing', 'menu_engineering',
    'price_tracking', 'bcc_audit', 'ai_scanner'
  )),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedule table for time-slot based ad rotation
CREATE TABLE IF NOT EXISTS ad_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES loading_ads(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat, NULL=every day
  start_hour INTEGER NOT NULL DEFAULT 0 CHECK (start_hour BETWEEN 0 AND 23),
  end_hour INTEGER NOT NULL DEFAULT 23 CHECK (end_hour BETWEEN 0 AND 23),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Impressions / events tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES loading_ads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'tap')),
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loading_ads_active ON loading_ads(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_loading_ads_dates ON loading_ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_created ON ad_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_schedule_ad_id ON ad_schedule(ad_id);

-- RPC: Get currently active ads (filters by date + active flag)
CREATE OR REPLACE FUNCTION get_active_loading_ads()
RETURNS SETOF loading_ads
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM loading_ads
  WHERE is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  ORDER BY priority DESC, created_at DESC;
$$;

-- RPC: Get ad stats for admin dashboard
CREATE OR REPLACE FUNCTION get_ad_stats(p_ad_id UUID)
RETURNS TABLE (
  impressions BIGINT,
  taps BIGINT,
  tap_rate NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
    COUNT(*) FILTER (WHERE event_type = 'tap') AS taps,
    CASE
      WHEN COUNT(*) FILTER (WHERE event_type = 'impression') > 0
      THEN ROUND(
        COUNT(*) FILTER (WHERE event_type = 'tap')::NUMERIC /
        COUNT(*) FILTER (WHERE event_type = 'impression')::NUMERIC * 100,
        2
      )
      ELSE 0
    END AS tap_rate
  FROM ad_impressions
  WHERE ad_id = p_ad_id;
$$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_loading_ads_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_loading_ads_updated_at ON loading_ads;
CREATE TRIGGER trg_loading_ads_updated_at
  BEFORE UPDATE ON loading_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_loading_ads_updated_at();

-- Enable RLS
ALTER TABLE loading_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- Policies: ads are publicly readable, impressions are insert-only for anon
CREATE POLICY "loading_ads_public_read" ON loading_ads
  FOR SELECT USING (true);

CREATE POLICY "ad_schedule_public_read" ON ad_schedule
  FOR SELECT USING (true);

CREATE POLICY "ad_impressions_insert" ON ad_impressions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ad_impressions_read" ON ad_impressions
  FOR SELECT USING (true);

-- Seed 3 default ads
INSERT INTO loading_ads (title, subtitle, cta_text, screen_preset, priority, is_active)
VALUES
  ('Kitchen Dashboard', 'Track food cost, margins & revenue in real-time', 'Coming in Prep Mi Pro', 'dashboard', 10, true),
  ('Recipe Costing', 'Know your exact cost per plate, per serve', 'Coming in Prep Mi Pro', 'recipe_costing', 9, true),
  ('Menu Engineering', 'Stars, Puzzles, Plowhorses & Dogs — optimise your menu', 'Coming in Prep Mi Pro', 'menu_engineering', 8, true)
ON CONFLICT DO NOTHING;
