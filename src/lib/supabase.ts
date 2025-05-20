import { createClient } from "@supabase/supabase-js";

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check for missing credentials
if (!supabaseUrl || !supabaseAnonKey) {
  // Log error but don't throw during server-side rendering
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  }
}

// Create and export the Supabase client
// We use empty strings as fallbacks to prevent build errors, but the client won't work without proper credentials
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');