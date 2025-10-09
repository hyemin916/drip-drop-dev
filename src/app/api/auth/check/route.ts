import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

// GET /api/auth/check - Check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    // Extract auth token from headers or cookies
    const cookies = new Map<string, string>();
    request.cookies.getAll().forEach((cookie) => {
      cookies.set(cookie.name, cookie.value);
    });

    const isAuthenticated = AuthService.isAuthenticated(request.headers, cookies);

    if (!isAuthenticated) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
