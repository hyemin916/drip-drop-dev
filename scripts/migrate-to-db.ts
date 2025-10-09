import { promises as fs } from 'fs';
import path from 'path';
import { getSupabase } from '../src/lib/db';
import { MarkdownService } from '../src/services/MarkdownService';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

async function migrateMarkdownToDatabase() {
  console.log('Starting migration from markdown files to database...\n');

  try {
    const supabase = getSupabase();

    // Initialize database schema
    console.log('Creating database schema...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          excerpt VARCHAR(200) NOT NULL,
          category VARCHAR(50) NOT NULL CHECK (category IN ('Daily', 'Dev')),
          thumbnail VARCHAR(500),
          author VARCHAR(100) NOT NULL,
          published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `,
    });
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)',
    });
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)',
    });
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC)',
    });
    console.log('✓ Database schema created\n');

    // Read all markdown files
    const files = await fs.readdir(CONTENT_DIR);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    console.log(`Found ${markdownFiles.length} markdown files to migrate\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const file of markdownFiles) {
      const filePath = path.join(CONTENT_DIR, file);

      try {
        // Parse markdown file
        const parsed = await MarkdownService.parseMarkdownFile(filePath);
        const { frontmatter, content } = parsed;

        // Check if post already exists
        const { data: existing } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', frontmatter.slug)
          .single();

        if (existing) {
          console.log(`⚠ Skipping ${file} - already exists in database`);
          skipCount++;
          continue;
        }

        // Insert post
        const { error } = await supabase.from('posts').insert({
          slug: frontmatter.slug,
          title: frontmatter.title,
          content,
          excerpt: frontmatter.excerpt,
          category: frontmatter.category,
          thumbnail: frontmatter.thumbnail || null,
          author: frontmatter.author,
          published_at: frontmatter.publishedAt,
          updated_at: frontmatter.updatedAt || null,
        });

        if (error) {
          throw error;
        }

        console.log(`✓ Migrated ${file}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error migrating ${file}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration complete!');
    console.log(`✓ Success: ${successCount}`);
    console.log(`⚠ Skipped: ${skipCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateMarkdownToDatabase()
  .then(() => {
    console.log('\nMigration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
