import { Stack } from "expo-router";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tools/recipe-scaler"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="tools/unit-converter"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="tools/multi-timer"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="tools/cost-portion"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="tools/yield-calculator"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="reference/two-four-hour"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="reference/temperature-guide"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="reference/sous-vide"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="reference/butchery-charts"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="reference/allergens"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
