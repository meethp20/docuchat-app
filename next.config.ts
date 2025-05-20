import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use serverExternalPackages instead of the deprecated serverComponentsExternalPackages
  serverExternalPackages: ['pdf-parse'],
  webpack: (config) => {
    // Add canvas to externals for pdf-parse compatibility
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  // Ensure environment variables are properly handled
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
};

export default nextConfig;
