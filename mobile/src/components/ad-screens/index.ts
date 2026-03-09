import React from "react";
import IntroSlide from "./IntroSlide";
import DashboardScreen from "./DashboardScreen";
import RecipeCostingScreen from "./RecipeCostingScreen";
import MenuEngineeringScreen from "./MenuEngineeringScreen";
import PriceTrackingScreen from "./PriceTrackingScreen";
import BccAuditScreen from "./BccAuditScreen";
import AiScannerScreen from "./AiScannerScreen";
import CtaSlide from "./CtaSlide";

export type AdScreenPreset =
  | "intro"
  | "dashboard"
  | "recipe_costing"
  | "menu_engineering"
  | "price_tracking"
  | "bcc_audit"
  | "ai_scanner"
  | "cta";

export const AD_SCREEN_COMPONENTS: Record<AdScreenPreset, React.ComponentType> = {
  intro: IntroSlide,
  dashboard: DashboardScreen,
  recipe_costing: RecipeCostingScreen,
  menu_engineering: MenuEngineeringScreen,
  price_tracking: PriceTrackingScreen,
  bcc_audit: BccAuditScreen,
  ai_scanner: AiScannerScreen,
  cta: CtaSlide,
};

export const AD_SCREEN_TITLES: Record<AdScreenPreset, string> = {
  intro: "",
  dashboard: "Live Dashboard",
  recipe_costing: "Recipe Costing",
  menu_engineering: "Menu Engineering",
  price_tracking: "Price Tracking",
  bcc_audit: "Food Safety Audit",
  ai_scanner: "AI Scanner",
  cta: "",
};

export const AD_SCREEN_SUBTITLES: Record<AdScreenPreset, string> = {
  intro: "",
  dashboard: "Your kitchen at a glance",
  recipe_costing: "Know your cost per plate, live",
  menu_engineering: "See which dishes make money",
  price_tracking: "Monitor supplier prices in real-time",
  bcc_audit: "Inspector ready in one tap",
  ai_scanner: "Scan anything. AI fills the rest.",
  cta: "",
};

// Dark background slides (bookends)
export const DARK_SLIDES: AdScreenPreset[] = ["intro", "cta"];

export const ALL_PRESETS: AdScreenPreset[] = [
  "intro",
  "dashboard",
  "recipe_costing",
  "menu_engineering",
  "bcc_audit",
  "ai_scanner",
  "cta",
];
