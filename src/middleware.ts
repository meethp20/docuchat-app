// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the request is not for the login page
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    // Redirect to login page
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  // Skip this middleware for static files and api routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};