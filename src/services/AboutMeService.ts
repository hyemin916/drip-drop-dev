import { AboutMe, AboutMeUpdate } from '@/models/AboutMe';
import { getSupabase } from '@/lib/db';

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
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('about_me')
        .select('*')
        .eq('id', 1)
        .single();

      if (error || !data) {
        return null;
      }

      const row = data as AboutMeRow;

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
    const supabase = getSupabase();
    const now = new Date();

    try {
      // Check if row exists
      const { data: existing } = await supabase
        .from('about_me')
        .select('id')
        .eq('id', 1)
        .single();

      if (!existing) {
        // Insert new row
        const { error } = await supabase.from('about_me').insert({
          id: 1,
          content: data.content,
          author,
          updated_at: now.toISOString(),
        });

        if (error) {
          throw new Error(`Failed to create About Me: ${error.message}`);
        }
      } else {
        // Update existing row
        const { error } = await supabase
          .from('about_me')
          .update({
            content: data.content,
            author,
            updated_at: now.toISOString(),
          })
          .eq('id', 1);

        if (error) {
          throw new Error(`Failed to update About Me: ${error.message}`);
        }
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
