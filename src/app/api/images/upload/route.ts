import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/services/ImageService';
import { AuthService } from '@/services/AuthService';

// POST /api/images/upload - Upload and process image
export async function POST(request: NextRequest) {
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

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!alt) {
      return NextResponse.json(
        { error: 'Alt text is required for accessibility' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload and process image
    const image = await ImageService.uploadImage({
      buffer,
      originalName: file.name,
      mimetype: file.type,
      alt,
      caption,
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);

    if (error instanceof Error) {
      if (error.message.includes('exceeds maximum')) {
        return NextResponse.json(
          { error: error.message },
          { status: 413 }
        );
      }

      if (error.message.includes('Unsupported')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
