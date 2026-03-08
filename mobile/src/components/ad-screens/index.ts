import React from "react";
import DashboardScreen from "./DashboardScreen";
import RecipeCostingScreen from "./RecipeCostingScreen";
import MenuEngineeringScreen from "./MenuEngineeringScreen";
import PriceTrackingScreen from "./PriceTrackingScreen";
import BccAuditScreen from "./BccAuditScreen";
import AiScannerScreen from "./AiScannerScreen";

export type AdScreenPreset =
  | "dashboard"
  | "recipe_costing"
  | "menu_engineering"
  | "price_tracking"
  | "bcc_audit"
  | "ai_scanner";

export const AD_SCREEN_COMPONENTS: Record<AdScreenPreset, React.ComponentType> = {
  dashboard: DashboardScreen,
  recipe_costing: RecipeCostingScreen,
  menu_engineering: MenuEngineeringScreen,
  price_tracking: PriceTrackingScreen,
  bcc_audit: BccAuditScreen,
  ai_scanner: AiScannerScreen,
};

export const AD_SCREEN_TITLES: Record<AdScreenPreset, string> = {
  dashboard: "Kitchen Dashboard",
  recipe_costing: "Recipe Costing",
  menu_engineering: "Menu Engineering",
  price_tracking: "Price Tracking",
  bcc_audit: "BCC Audit Trail",
  ai_scanner: "AI Invoice Scanner",
};

export const ALL_PRESETS: AdScreenPreset[] = [
  "dashboard",
  "recipe_costing",
  "menu_engineering",
  "price_tracking",
  "bcc_audit",
  "ai_scanner",
];
