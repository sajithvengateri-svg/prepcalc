import { useEffect, useState, useCallback } from "react";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TIMER_VOICE_KEY = "timer_voice_style";

export type VoiceStyle =
  | "yes_chef"
  | "fire"
  | "heard"
  | "behind"
  | "service"
  | "buzz_only";

export interface VoiceOption {
  id: VoiceStyle;
  label: string;
  phrase: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "yes_chef", label: "Yes Chef", phrase: "Yes Chef! Timer done." },
  { id: "fire", label: "Ready to Fire", phrase: "Ready to fire, Chef!" },
  { id: "heard", label: "Heard", phrase: "Heard! Time's up." },
  { id: "behind", label: "Behind", phrase: "Behind! Timer's done, Chef." },
  { id: "service", label: "Service", phrase: "Service! Let's go, Chef!" },
  { id: "buzz_only", label: "Buzz Only", phrase: "" },
];

export function useTimerVoice() {
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("yes_chef");

  useEffect(() => {
    AsyncStorage.getItem(TIMER_VOICE_KEY).then((val) => {
      if (val) setVoiceStyle(val as VoiceStyle);
    });
  }, []);

  const updateVoice = useCallback(async (style: VoiceStyle) => {
    setVoiceStyle(style);
    await AsyncStorage.setItem(TIMER_VOICE_KEY, style);
  }, []);

  const speak = useCallback(
    (timerName?: string) => {
      const option = VOICE_OPTIONS.find((v) => v.id === voiceStyle);
      if (!option || voiceStyle === "buzz_only" || !option.phrase) return;

      const text = timerName
        ? `${option.phrase} ${timerName} is ready.`
        : option.phrase;

      Speech.speak(text, {
        language: "en-AU",
        pitch: 1.0,
        rate: 0.95,
      });
    },
    [voiceStyle]
  );

  const preview = useCallback((style: VoiceStyle) => {
    const option = VOICE_OPTIONS.find((v) => v.id === style);
    if (!option || style === "buzz_only" || !option.phrase) return;
    Speech.speak(option.phrase, {
      language: "en-AU",
      pitch: 1.0,
      rate: 0.95,
    });
  }, []);

  return { voiceStyle, updateVoice, speak, preview };
}
