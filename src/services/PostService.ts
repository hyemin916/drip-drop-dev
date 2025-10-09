import { Post, PostCreate, PostUpdate, PostSummary } from '@/models/Post';
import { Category } from '@/models/Category';
import { Image } from '@/models/Image';
import { sql } from '@/lib/db';
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

interface PostSummaryRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  thumbnail: string | null;
  author: string;
  published_at: string;
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

    // Build query
    const offset = (page - 1) * limit;

    let countQuery;
    let postsQuery;

    if (category) {
      countQuery = sql`SELECT COUNT(*) as count FROM posts WHERE category = ${category}`;
      postsQuery = sql`
        SELECT id, slug, title, excerpt, category, thumbnail, author, published_at
        FROM posts
        WHERE category = ${category}
        ORDER BY published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      countQuery = sql`SELECT COUNT(*) as count FROM posts`;
      postsQuery = sql`
        SELECT id, slug, title, excerpt, category, thumbnail, author, published_at
        FROM posts
        ORDER BY published_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const [countResult, postsResult] = await Promise.all([
      countQuery,
      postsQuery,
    ]);

    const total = parseInt(countResult.rows[0]?.count || '0', 10);

    const posts: PostSummary[] = (postsResult.rows as PostSummaryRow[]).map((row) => ({
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
      const result = await sql`
        SELECT * FROM posts WHERE slug = ${slug} LIMIT 1
      `;

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0] as PostRow;

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
    const now = new Date();

    // Check if slug already exists
    const existing = await sql`SELECT id FROM posts WHERE slug = ${data.slug} LIMIT 1`;
    if (existing.rows.length > 0) {
      throw new Error(`Post with slug "${data.slug}" already exists`);
    }

    // Insert post
    await sql`
      INSERT INTO posts (slug, title, content, excerpt, category, thumbnail, author, published_at)
      VALUES (
        ${data.slug},
        ${data.title},
        ${data.content},
        ${data.excerpt},
        ${data.category},
        ${data.thumbnail || null},
        ${data.author},
        ${now.toISOString()}
      )
    `;

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
    const existingPost = await this.getPostBySlug(slug);
    if (!existingPost) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const now = new Date();

    // If slug is changing, check new slug doesn't exist
    if (data.slug && data.slug !== slug) {
      const existing = await sql`SELECT id FROM posts WHERE slug = ${data.slug} LIMIT 1`;
      if (existing.rows.length > 0) {
        throw new Error(`Post with slug "${data.slug}" already exists`);
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      values.push(data.slug);
    }
    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }
    if (data.excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex++}`);
      values.push(data.excerpt);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }
    if (data.thumbnail !== undefined) {
      updates.push(`thumbnail = $${paramIndex++}`);
      values.push(data.thumbnail);
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(now.toISOString());

    values.push(slug);

    await sql.query(
      `UPDATE posts SET ${updates.join(', ')} WHERE slug = $${paramIndex}`,
      values
    );

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
    const result = await sql`DELETE FROM posts WHERE slug = ${slug}`;

    if (result.rowCount === 0) {
      throw new Error(`Post with slug "${slug}" not found`);
    }
  }
}
