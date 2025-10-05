import { promises as fs } from 'fs';
import path from 'path';
import { Post, PostCreate, PostUpdate, PostSummary } from '@/models/Post';
import { Category } from '@/models/Category';
import { Image } from '@/models/Image';
import { MarkdownService } from './MarkdownService';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

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

    // Get all post files
    const files = await fs.readdir(CONTENT_DIR);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    // Parse all posts
    const posts: PostSummary[] = [];
    for (const file of markdownFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const parsed = await MarkdownService.parseMarkdownFile(filePath);

      // Filter by category if specified
      if (category && parsed.frontmatter.category !== category) {
        continue;
      }

      posts.push({
        id: parsed.frontmatter.slug,
        title: parsed.frontmatter.title,
        slug: parsed.frontmatter.slug,
        excerpt: parsed.frontmatter.excerpt,
        category: parsed.frontmatter.category,
        publishedAt: new Date(parsed.frontmatter.publishedAt),
        thumbnail: parsed.frontmatter.thumbnail
          ? {
              id: '',
              url: parsed.frontmatter.thumbnail,
              alt: parsed.frontmatter.title,
              caption: null,
              width: 400,
              height: 300,
              format: 'webp',
              fileSize: 0,
              uploadedAt: new Date(),
            }
          : null,
        author: parsed.frontmatter.author,
      });
    }

    // Sort by publishedAt descending (newest first)
    posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = posts.slice(start, end);

    return {
      posts: paginatedPosts,
      total: posts.length,
    };
  }

  /**
   * Get post by slug
   */
  static async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const files = await fs.readdir(CONTENT_DIR);
      const file = files.find((f) => f.includes(slug) && f.endsWith('.md'));

      if (!file) {
        return null;
      }

      const filePath = path.join(CONTENT_DIR, file);
      const parsed = await MarkdownService.parseMarkdownFile(filePath);

      // Extract images from content
      const imageMatches = MarkdownService.extractImagesFromMarkdown(parsed.content);
      const images: Image[] = imageMatches.map((img, index) => ({
        id: `${slug}-img-${index}`,
        url: img.url,
        alt: img.alt || parsed.frontmatter.title,
        caption: img.caption,
        width: 800,
        height: 600,
        format: 'webp',
        fileSize: 0,
        uploadedAt: new Date(),
      }));

      // Determine thumbnail
      let thumbnail: Image | null = null;
      if (parsed.frontmatter.thumbnail) {
        thumbnail = {
          id: `${slug}-thumb`,
          url: parsed.frontmatter.thumbnail,
          alt: parsed.frontmatter.title,
          caption: null,
          width: 400,
          height: 300,
          format: 'webp',
          fileSize: 0,
          uploadedAt: new Date(),
        };
      } else if (images.length > 0) {
        thumbnail = images[0];
      }

      return {
        id: parsed.frontmatter.slug,
        title: parsed.frontmatter.title,
        slug: parsed.frontmatter.slug,
        content: parsed.content,
        excerpt: parsed.frontmatter.excerpt,
        category: parsed.frontmatter.category,
        publishedAt: new Date(parsed.frontmatter.publishedAt),
        updatedAt: parsed.frontmatter.updatedAt ? new Date(parsed.frontmatter.updatedAt) : null,
        thumbnail,
        images,
        author: parsed.frontmatter.author,
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
    const datePrefix = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${datePrefix}-${data.slug}.md`;
    const filePath = path.join(CONTENT_DIR, fileName);

    // Check if file already exists
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      throw new Error(`Post with slug "${data.slug}" already exists`);
    }

    // Create frontmatter
    const frontmatter = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      category: data.category,
      publishedAt: now.toISOString(),
      updatedAt: null,
      thumbnail: data.thumbnail || null,
      author: data.author,
    };

    // Create Markdown content
    const markdownContent = MarkdownService.createMarkdownContent(frontmatter, data.content);

    // Write file
    await fs.writeFile(filePath, markdownContent, 'utf-8');

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

    // Find the file
    const files = await fs.readdir(CONTENT_DIR);
    const file = files.find((f) => f.includes(slug) && f.endsWith('.md'));

    if (!file) {
      throw new Error(`Post file for slug "${slug}" not found`);
    }

    const filePath = path.join(CONTENT_DIR, file);
    const parsed = await MarkdownService.parseMarkdownFile(filePath);

    // Update frontmatter
    const updatedFrontmatter = {
      ...parsed.frontmatter,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updatedContent = data.content || parsed.content;

    // Create updated Markdown content
    const markdownContent = MarkdownService.createMarkdownContent(
      updatedFrontmatter,
      updatedContent
    );

    // Write updated file
    await fs.writeFile(filePath, markdownContent, 'utf-8');

    // If slug changed, rename file
    if (data.slug && data.slug !== slug) {
      const datePrefix = file.split('-').slice(0, 3).join('-'); // Keep date prefix
      const newFileName = `${datePrefix}-${data.slug}.md`;
      const newFilePath = path.join(CONTENT_DIR, newFileName);
      await fs.rename(filePath, newFilePath);

      const updatedPost = await this.getPostBySlug(data.slug);
      if (!updatedPost) {
        throw new Error('Failed to update post');
      }
      return updatedPost;
    }

    const updatedPost = await this.getPostBySlug(slug);
    if (!updatedPost) {
      throw new Error('Failed to update post');
    }

    return updatedPost;
  }

  /**
   * Delete post
   */
  static async deletePost(slug: string): Promise<void> {
    const files = await fs.readdir(CONTENT_DIR);
    const file = files.find((f) => f.includes(slug) && f.endsWith('.md'));

    if (!file) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const filePath = path.join(CONTENT_DIR, file);
    await fs.unlink(filePath);
  }
}
