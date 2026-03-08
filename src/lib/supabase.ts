import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://twxysmsntweutblkfzdi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eHlzbXNudHdldXRibGtmemRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDA3MzcsImV4cCI6MjA4Nzg3NjczN30.k2ETBAVTuIPKK7CE50JHpnvXr3bcpIncMjkDypEVoe0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
