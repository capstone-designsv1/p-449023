
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://abhynrggccdsyfeibegh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaHlucmdnY2Nkc3lmZWliZWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNTYxNzMsImV4cCI6MjA1ODYzMjE3M30.cKdYZ5DD0D-YK6V5n5JEJuP-vSI1ux4xngBTTQ4HAyY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
