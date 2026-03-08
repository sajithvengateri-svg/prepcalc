import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ??
  "https://twxysmsntweutblkfzdi.supabase.co";
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  "sb_publishable_SYCJwaryXxxtirbkUynfTw_8MmWGdtJ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
