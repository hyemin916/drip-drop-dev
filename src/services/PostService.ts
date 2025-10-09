import { Post, PostCreate, PostUpdate, PostSummary } from '@/models/Post';
import { Category } from '@/models/Category';
import { Image } from '@/models/Image';
import { getSupabase } from '@/lib/db';
import { MarkdownService } from './MarkdownService';

// Database row types
interface PostRow {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  thumbnail: string | null;
  author: string;
  published_at: string;
  updated_at: string | null;
  created_at: string;
}


interface ImageMatch {
  alt: string;
  url: string;
  caption: string | null;
}

export class PostService {
  /**
   * Get all posts with optional pagination and filtering
   */
  static async getAllPosts(options?: {
    page?: number;
    limit?: number;
    category?: Category;
  }): Promise<{ posts: PostSummary[]; total: number }> {
    const { page = 1, limit = 10, category } = options || {};
    const supabase = getSupabase();

    // Build query
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select('id, slug, title, excerpt, category, thumbnail, author, published_at', {
        count: 'exact',
      })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0 };
    }

    const total = count || 0;

    const posts: PostSummary[] = (data || []).map((row) => ({
      id: row.slug,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      category: row.category as Category,
      publishedAt: new Date(row.published_at).toISOString(),
      thumbnail: row.thumbnail
        ? {
            id: '',
            url: row.thumbnail,
            alt: row.title,
            caption: null,
            width: 400,
            height: 300,
            format: 'webp' as const,
            fileSize: 0,
            uploadedAt: new Date(),
          }
        : null,
      author: row.author,
      summary: row.excerpt,
    }));

    return {
      posts,
      total,
    };
  }

  /**
   * Get post by slug
   */
  static async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return null;
      }

      const row = data as PostRow;

      // Extract images from content
      const imageMatches = MarkdownService.extractImagesFromMarkdown(row.content);
      const images: Image[] = (imageMatches as ImageMatch[]).map((img, index) => ({
        id: `${slug}-img-${index}`,
        url: img.url,
        alt: img.alt || row.title,
        caption: img.caption,
        width: 800,
        height: 600,
        format: 'webp' as const,
        fileSize: 0,
        uploadedAt: new Date(),
      }));

      // Determine thumbnail
      let thumbnail: Image | null = null;
      if (row.thumbnail) {
        thumbnail = {
          id: `${slug}-thumb`,
          url: row.thumbnail,
          alt: row.title,
          caption: null,
          width: 400,
          height: 300,
          format: 'webp' as const,
          fileSize: 0,
          uploadedAt: new Date(),
        };
      } else if (images.length > 0) {
        thumbnail = images[0];
      }

      return {
        id: row.slug,
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt,
        category: row.category as Category,
        publishedAt: new Date(row.published_at),
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
        thumbnail,
        images,
        author: row.author,
      };
    } catch (error) {
      console.error(`Error getting post by slug ${slug}:`, error);
      return null;
    }
  }

  /**
   * Create new post
   */
  static async createPost(data: PostCreate): Promise<Post> {
    const supabase = getSupabase();
    const now = new Date();

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', data.slug)
      .single();

    if (existing) {
      throw new Error(`Post with slug "${data.slug}" already exists`);
    }

    // Insert post
    const { error } = await supabase.from('posts').insert({
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      thumbnail: data.thumbnail || null,
      author: data.author,
      published_at: now.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    // Return created post
    const post = await this.getPostBySlug(data.slug);
    if (!post) {
      throw new Error('Failed to create post');
    }

    return post;
  }

  /**
   * Update existing post
   */
  static async updatePost(slug: string, data: PostUpdate): Promise<Post> {
    const supabase = getSupabase();
    const existingPost = await this.getPostBySlug(slug);
    if (!existingPost) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const now = new Date();

    // If slug is changing, check new slug doesn't exist
    if (data.slug && data.slug !== slug) {
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', data.slug)
        .single();

      if (existing) {
        throw new Error(`Post with slug "${data.slug}" already exists`);
      }
    }

    // Build update object
    const updates: Record<string, string | null> = {
      updated_at: now.toISOString(),
    };

    if (data.title !== undefined) updates.title = data.title;
    if (data.slug !== undefined) updates.slug = data.slug;
    if (data.content !== undefined) updates.content = data.content;
    if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
    if (data.category !== undefined) updates.category = data.category;
    if (data.thumbnail !== undefined) updates.thumbnail = data.thumbnail;

    const { error } = await supabase.from('posts').update(updates).eq('slug', slug);

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    const updatedSlug = data.slug || slug;
    const updatedPost = await this.getPostBySlug(updatedSlug);
    if (!updatedPost) {
      throw new Error('Failed to update post');
    }

    return updatedPost;
  }

  /**
   * Delete post
   */
  static async deletePost(slug: string): Promise<void> {
    const supabase = getSupabase();
    const { error, count } = await supabase.from('posts').delete().eq('slug', slug);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    if (count === 0) {
      throw new Error(`Post with slug "${slug}" not found`);
    }
  }
}
