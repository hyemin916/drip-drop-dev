import { NextRequest, NextResponse } from 'next/server';
import { AboutMeService } from '@/services/AboutMeService';
import { AuthService } from '@/services/AuthService';
import { AboutMeUpdateSchema } from '@/models/AboutMe';

// GET /api/about - Get About Me content
export async function GET(request: NextRequest) {
  try {
    const aboutMe = await AboutMeService.getAboutMe();

    if (!aboutMe) {
      return NextResponse.json(
        { error: 'About Me content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(aboutMe);
  } catch (error) {
    console.error('Error fetching About Me:', error);
    return NextResponse.json(
      { error: 'Failed to fetch About Me content' },
      { status: 500 }
    );
  }
}

// PUT /api/about - Update About Me
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const cookies = new Map<string, string>();
    request.cookies.getAll().forEach((cookie) => {
      cookies.set(cookie.name, cookie.value);
    });

    if (!AuthService.isAuthenticated(request.headers, cookies)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const validationResult = AboutMeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }

    // Get owner info
    const owner = AuthService.getOwnerInfo();

    // Update About Me
    const aboutMe = await AboutMeService.updateAboutMe(
      validationResult.data,
      owner.name
    );

    return NextResponse.json(aboutMe);
  } catch (error) {
    console.error('Error updating About Me:', error);
    return NextResponse.json(
      { error: 'Failed to update About Me content' },
      { status: 500 }
    );
  }
}
