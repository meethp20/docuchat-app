// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    
    // Create a Supabase client using the modern @supabase/ssr package
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name) {
            return req.cookies.get(name)?.value;
          },
          set(name, value, options) {
            // If the cookie is updated, update the cookies for the request and response
            req.cookies.set({
              name,
              value,
              ...options,
            });
            res.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name, options) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            });
            res.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Skip auth check if environment variables aren't available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase credentials missing in middleware');
      return res;
    }
    
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    // If there's no session and the request is not for the login page
    if (!session && req.nextUrl.pathname !== '/') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
    
    return res;
  } catch (error) {
    // Log the error but don't block the request
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  // Skip this middleware for static files and api routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
