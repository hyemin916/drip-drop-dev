import { sql } from '@vercel/postgres';

export { sql };

/**
 * Initialize database schema
 * This should be called once during setup
 */
export async function initDatabase() {
  await sql`
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
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC)`;
}
