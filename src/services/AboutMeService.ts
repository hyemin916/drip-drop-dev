import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { AboutMe, AboutMeUpdate } from '@/models/AboutMe';
import { MarkdownService } from './MarkdownService';

const ABOUT_ME_PATH = path.join(process.cwd(), 'content', 'about', 'me.md');

export class AboutMeService {
  /**
   * Get About Me content
   */
  static async getAboutMe(): Promise<AboutMe | null> {
    try {
      const exists = await fs
        .access(ABOUT_ME_PATH)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return null;
      }

      const fileContent = await fs.readFile(ABOUT_ME_PATH, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        id: 'about-me',
        content: content.trim(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        author: data.author || 'Unknown',
        image: data.image,
        email: data.email,
        github: data.github,
        twitter: data.twitter,
        linkedin: data.linkedin,
      };
    } catch (error) {
      console.error('Error getting About Me:', error);
      return null;
    }
  }

  /**
   * Update About Me content
   */
  static async updateAboutMe(data: AboutMeUpdate, author: string): Promise<AboutMe> {
    const now = new Date();

    // Ensure directory exists
    const dir = path.dirname(ABOUT_ME_PATH);
    await fs.mkdir(dir, { recursive: true });

    // Check if file exists to preserve publishedAt
    let publishedAt = now.toISOString();
    try {
      const existing = await MarkdownService.parseMarkdownFile(ABOUT_ME_PATH);
      publishedAt = existing.frontmatter.publishedAt;
    } catch {
      // File doesn't exist, use current time
    }

    // Create frontmatter
    const frontmatter = {
      title: 'About Me',
      slug: 'about-me',
      excerpt: '',
      category: 'Daily' as const,
      publishedAt,
      updatedAt: now.toISOString(),
      thumbnail: null,
      author,
    };

    // Create Markdown content
    const markdownContent = MarkdownService.createMarkdownContent(frontmatter, data.content);

    // Write file
    await fs.writeFile(ABOUT_ME_PATH, markdownContent, 'utf-8');

    return {
      id: 'about-me',
      content: data.content,
      updatedAt: now,
      author,
    };
  }
}
