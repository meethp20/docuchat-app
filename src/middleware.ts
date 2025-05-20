// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for handling authentication redirects
 * Uses a cookie-based approach to avoid Supabase initialization issues
 */
export async function middleware(req: NextRequest) {
  // Create the response early so we can always return it even if errors occur
  const res = NextResponse.next();

  try {
    // Get the pathname for easier reference
    const pathname = req.nextUrl.pathname;
    
    // Public paths that should always be accessible without authentication
    // Include all auth-related paths to prevent interference with the OAuth flow
    const publicPaths = [
      '/', 
      '/auth/callback', 
      '/api',
      '/auth/v1',
      '/supabase',
      '/rest/v1'
    ];
    
    // Check if the current path is public
    if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
      return res;
    }

    // More comprehensive check for Supabase auth cookies
    // This handles different naming conventions Supabase might use
    const hasPotentialAuthCookie = Array.from(req.cookies.getAll())
      .some(cookie => {
        const name = cookie.name.toLowerCase();
        return (
          name.includes('supabase') || 
          name.includes('sb-') || 
          name.includes('auth') ||
          name.includes('session')
        );
      });

    // If we detect any potential auth cookie, allow the request
    if (hasPotentialAuthCookie) {
      return res;
    }
    
    // No auth cookie detected, redirect to home page
    try {
      const redirectUrl = new URL('/', req.url);
      console.log(`Redirecting unauthenticated request from ${pathname} to ${redirectUrl.pathname}`);
      return NextResponse.redirect(redirectUrl);
    } catch (redirectError) {
      // If URL construction or redirect fails, log it but still return a response
      console.error('Redirect error in middleware:', redirectError);
      return res;
    }
  } catch (error) {
    // Detailed error logging
    console.error(`Middleware error processing ${req.nextUrl.pathname}:`, error);
    // Always return the response to prevent the request from failing completely
    return res;
  }
}

/**
 * Configure which paths the middleware should run on
 * Explicitly exclude static files, images, and other resources
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes that handle their own auth
     * - Static files (images, js, css, etc)
     * - Favicon, manifest, and other browser files
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|assets/|public/).*)',
  ],
};
