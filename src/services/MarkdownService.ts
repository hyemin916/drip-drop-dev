import matter from 'gray-matter';
import { promises as fs } from 'fs';

export interface FrontmatterData {
  title: string;
  slug: string;
  excerpt: string;
  category: '일상' | '개발';
  publishedAt: string;
  updatedAt?: string | null;
  thumbnail?: string | null;
  author: string;
}

export interface ParsedMarkdown {
  frontmatter: FrontmatterData;
  content: string;
}

export class MarkdownService {
  /**
   * Parse a Markdown file and extract frontmatter + content
   */
  static async parseMarkdownFile(filePath: string): Promise<ParsedMarkdown> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return this.extractFrontmatter(fileContent);
    } catch (error) {
      throw new Error(`Failed to parse Markdown file: ${filePath}. ${error}`);
    }
  }

  /**
   * Extract frontmatter from Markdown content string
   */
  static extractFrontmatter(content: string): ParsedMarkdown {
    try {
      const { data, content: markdownContent } = matter(content);

      // Validate required fields
      if (!data.title || !data.slug || !data.category || !data.publishedAt || !data.author) {
        throw new Error('Missing required frontmatter fields: title, slug, category, publishedAt, author');
      }

      // Validate category
      if (data.category !== '일상' && data.category !== '개발') {
        throw new Error(`Invalid category: ${data.category}. Must be "일상" or "개발"`);
      }

      return {
        frontmatter: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || '',
          category: data.category,
          publishedAt: data.publishedAt,
          updatedAt: data.updatedAt || null,
          thumbnail: data.thumbnail || null,
          author: data.author,
        },
        content: markdownContent.trim(),
      };
    } catch (error) {
      throw new Error(`Failed to extract frontmatter: ${error}`);
    }
  }

  /**
   * Create Markdown file content with frontmatter
   */
  static createMarkdownContent(frontmatter: FrontmatterData, content: string): string {
    const frontmatterData: Record<string, unknown> = {
      title: frontmatter.title,
      slug: frontmatter.slug,
      excerpt: frontmatter.excerpt,
      category: frontmatter.category,
      publishedAt: frontmatter.publishedAt,
      author: frontmatter.author,
    };

    if (frontmatter.updatedAt) {
      frontmatterData.updatedAt = frontmatter.updatedAt;
    }

    if (frontmatter.thumbnail) {
      frontmatterData.thumbnail = frontmatter.thumbnail;
    }

    return matter.stringify(content, frontmatterData);
  }

  /**
   * Extract images from Markdown content
   */
  static extractImagesFromMarkdown(content: string): Array<{
    alt: string;
    url: string;
    caption: string | null;
  }> {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g;
    const matches = [...content.matchAll(imageRegex)];

    return matches.map((match) => ({
      alt: match[1] || '',
      url: match[2],
      caption: match[3] || null,
    }));
  }
}
