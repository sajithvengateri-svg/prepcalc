import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { AdScreenPreset, ALL_PRESETS } from "../components/ad-screens";

// --- Types ---

export interface LoadingAd {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string | null;
  screen_preset: AdScreenPreset;
  priority: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface CachedAds {
  ads: LoadingAd[];
  fetched_at: number;
}

// --- Constants ---

const CACHE_KEY = "prepcalc-loading-ads";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
// Using supabase.functions.invoke() handles auth headers automatically

// --- Hardcoded fallback ads (always available offline) ---

export const FALLBACK_ADS: LoadingAd[] = [
  {
    id: "fallback-dashboard",
    title: "Kitchen Dashboard",
    subtitle: "Track food cost, margins & revenue in real-time",
    cta_text: "Coming in Prep Mi Pro",
    cta_url: null,
    screen_preset: "dashboard",
    priority: 10,
    is_active: true,
    start_date: null,
    end_date: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-recipe-costing",
    title: "Recipe Costing",
    subtitle: "Know your exact cost per plate, per serve",
    cta_text: "Coming in Prep Mi Pro",
    cta_url: null,
    screen_preset: "recipe_costing",
    priority: 9,
    is_active: true,
    start_date: null,
    end_date: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-menu-engineering",
    title: "Menu Engineering",
    subtitle: "Stars, Puzzles, Plowhorses & Dogs — optimise your menu",
    cta_text: "Coming in Prep Mi Pro",
    cta_url: null,
    screen_preset: "menu_engineering",
    priority: 8,
    is_active: true,
    start_date: null,
    end_date: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-price-tracking",
    title: "Price Tracking",
    subtitle: "Monitor supplier prices & catch increases early",
    cta_text: "Coming in Prep Mi Pro",
    cta_url: null,
    screen_preset: "price_tracking",
    priority: 7,
    is_active: true,
    start_date: null,
    end_date: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-bcc-audit",
    title: "BCC Audit Trail",
    subtitle: "Digital food safety checklists & compliance logs",
    cta_text: "Coming in Prep Mi Pro",
    cta_url: null,
    screen_preset: "bcc_audit",
    priority: 6,
    is_active: true,
    start_date: null,
    end_date: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "fallback-ai-scanner",
    title: "AI Invoice Scanner",
    subtitle: "Snap an invoice, auto-extract every line item",
    cta_text: "Coming in Prep Mi Pro",
    cta_url: null,
    screen_preset: "ai_scanner",
    priority: 5,
    is_active: true,
    start_date: null,
    end_date: null,
    created_at: new Date().toISOString(),
  },
];

// --- Service functions ---

/**
 * Fetch active ads from Supabase edge function, with cache.
 * Falls back to hardcoded ads if fetch fails.
 */
export async function fetchActiveAds(): Promise<LoadingAd[]> {
  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedAds = JSON.parse(cached);
      if (Date.now() - parsed.fetched_at < CACHE_TTL_MS) {
        return parsed.ads;
      }
    }
  } catch {
    // Cache miss or parse error — continue to fetch
  }

  // Fetch from edge function
  try {
    const { data, error } = await supabase.functions.invoke("get-active-ads");

    if (error) throw new Error("Failed to fetch ads");

    const ads: LoadingAd[] = data?.ads || [];

    if (ads.length > 0) {
      // Cache the result
      const cacheData: CachedAds = { ads, fetched_at: Date.now() };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      return ads;
    }
  } catch {
    // Network error — fall through to fallback
  }

  return FALLBACK_ADS;
}

/**
 * Pick ads to show in slideshow. Weighted by priority, shuffled.
 * Returns up to `count` ads.
 */
export function pickAdsForSlideshow(
  ads: LoadingAd[],
  count: number = 6
): LoadingAd[] {
  if (ads.length <= count) return shuffleArray([...ads]);

  // Weighted random selection by priority
  const weighted = ads.map((ad) => ({
    ad,
    weight: ad.priority + Math.random() * 3,
  }));
  weighted.sort((a, b) => b.weight - a.weight);

  return weighted.slice(0, count).map((w) => w.ad);
}

/**
 * Track an ad impression or tap event.
 * Fire-and-forget — does not block UI.
 */
export function trackAdEvent(
  adId: string,
  eventType: "impression" | "tap"
): void {
  // Don't track fallback ads
  if (adId.startsWith("fallback-")) return;

  supabase.functions.invoke("track-ad-event", {
    body: { ad_id: adId, event_type: eventType },
  }).catch(() => {
    // Silent fail — analytics should never break the app
  });
}

/**
 * Clear the ad cache (e.g., on manual refresh).
 */
export async function clearAdCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}

// --- Helpers ---

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
