import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PostService } from '@/services/PostService';
import { AuthService } from '@/services/AuthService';
import { PostUpdateSchema } from '@/models/Post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/posts/[slug] - Get post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await PostService.getPostBySlug(params.slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[slug] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    const validationResult = PostUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }

    // Update post
    const post = await PostService.updatePost(params.slug, validationResult.data);

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${params.slug}`);
    revalidateTag('posts');

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[slug] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Delete post
    await PostService.deletePost(params.slug);

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${params.slug}`);
    revalidateTag('posts');

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting post:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
