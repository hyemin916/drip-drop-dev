import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AboutMeService } from '@/services/AboutMeService';
import { AuthService } from '@/services/AuthService';
import { AboutMeUpdateSchema } from '@/models/AboutMe';

// GET /api/about - Get About Me content
export async function GET() {
  try {
    let aboutMe = await AboutMeService.getAboutMe();

    // If no About Me exists, return default empty content
    if (!aboutMe) {
      const owner = AuthService.getOwnerInfo();
      aboutMe = {
        id: 'about-me',
        content: '# About Me\n\nWrite about yourself here...',
        updatedAt: new Date(),
        author: owner.name,
      };
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

    // Revalidate About page
    revalidatePath('/about');

    return NextResponse.json(aboutMe);
  } catch (error) {
    console.error('Error updating About Me:', error);
    return NextResponse.json(
      { error: 'Failed to update About Me content' },
      { status: 500 }
    );
  }
}
