// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// A simplified middleware that only checks for auth cookie presence
// This avoids Supabase initialization issues in the middleware
export async function middleware(req: NextRequest) {
  // Get the response early
  const res = NextResponse.next();

  try {
    // Check if we're on the home page - always allow access
    if (req.nextUrl.pathname === '/') {
      return res;
    }

    // Check for auth cookie presence - this is a simple way to check if user is logged in
    // without initializing Supabase in middleware
    const hasAuthCookie = req.cookies.has('sb-access-token') || 
                         req.cookies.has('sb-refresh-token') ||
                         req.cookies.has('supabase-auth-token');

    // If no auth cookie and not on home page, redirect to home
    if (!hasAuthCookie) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }

    // User has auth cookie, allow access
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Always return a response even if there's an error
    return res;
  }
}

export const config = {
  // Skip this middleware for static files and api routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
