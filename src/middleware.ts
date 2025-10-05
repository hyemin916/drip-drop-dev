import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

export function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Extract auth token from headers or cookies
    const cookies = new Map<string, string>();
    request.cookies.getAll().forEach((cookie) => {
      cookies.set(cookie.name, cookie.value);
    });

    // Check if user is authenticated
    if (!AuthService.isAuthenticated(request.headers, cookies)) {
      // Redirect to homepage if not authenticated
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Continue to the requested page
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: '/admin/:path*',
};
