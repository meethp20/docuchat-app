import { createClient } from "@supabase/supabase-js";

// Default to empty strings to prevent build errors, but these will be replaced with actual values at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create the client if we have the required values
// This prevents errors during static build time
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

// Export the client, but with a safety check during initialization
export const supabase = supabaseClient || createClient(
  // Use dummy values that will be replaced at runtime with actual env vars
  'https://placeholder-url.supabase.co',
  'placeholder-key'
);