import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client with proper handling of environment variables
 * 
 * This implementation ensures we don't use placeholder values in production
 * while still allowing the build process to complete without errors
 */

// Function to create a client that can be used safely in both server and client contexts
const createSafeClient = () => {
  // In browser context, we can check if window is defined
  const isBrowser = typeof window !== 'undefined';
  
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Only create a real client if we have valid credentials
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  
  // For server-side rendering without env vars, create a non-functional client
  // This will be replaced with the real client on the client side
  if (!isBrowser) {
    // Return a mock client that doesn't make actual API calls during build
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
        signOut: async () => ({ error: null })
      }
    } as unknown as ReturnType<typeof createClient>;
  }
  
  // In browser context, if we still don't have credentials, log an error
  console.error('Supabase URL and Anon Key are required');
  throw new Error('Supabase credentials missing');
};

// Export the client
export const supabase = createSafeClient();