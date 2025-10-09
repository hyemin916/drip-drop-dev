import { AboutMe, AboutMeUpdate } from '@/models/AboutMe';
import { sql } from '@/lib/db';

// Database row type
interface AboutMeRow {
  id: number;
  content: string;
  image: string | null;
  email: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  author: string;
  updated_at: string;
  created_at: string;
}

export class AboutMeService {
  /**
   * Get About Me content
   */
  static async getAboutMe(): Promise<AboutMe | null> {
    try {
      const result = await sql`
        SELECT * FROM about_me WHERE id = 1 LIMIT 1
      `;

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0] as AboutMeRow;

      return {
        id: 'about-me',
        content: row.content,
        updatedAt: new Date(row.updated_at),
        author: row.author,
        image: row.image || undefined,
        email: row.email || undefined,
        github: row.github || undefined,
        twitter: row.twitter || undefined,
        linkedin: row.linkedin || undefined,
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

    try {
      // Check if row exists
      const existing = await sql`SELECT id FROM about_me WHERE id = 1 LIMIT 1`;

      if (existing.rows.length === 0) {
        // Insert new row
        await sql`
          INSERT INTO about_me (id, content, author, updated_at)
          VALUES (1, ${data.content}, ${author}, ${now.toISOString()})
        `;
      } else {
        // Update existing row
        await sql`
          UPDATE about_me
          SET content = ${data.content},
              author = ${author},
              updated_at = ${now.toISOString()}
          WHERE id = 1
        `;
      }

      return {
        id: 'about-me',
        content: data.content,
        updatedAt: now,
        author,
      };
    } catch (error) {
      console.error('Error updating About Me:', error);
      throw new Error('Failed to update About Me');
    }
  }
}
