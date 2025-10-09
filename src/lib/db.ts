import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

/**
 * Initialize database schema
 * This should be called once during setup
 */
export async function initDatabase() {
  const supabase = getSupabase();

  // Create posts table
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

  // Create indexes
  await supabase.rpc('exec_sql', {
    sql: 'CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)',
  });
  await supabase.rpc('exec_sql', {
    sql: 'CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)',
  });
  await supabase.rpc('exec_sql', {
    sql: 'CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC)',
  });

  // Create about_me table
  await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS about_me (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        image VARCHAR(500),
        email VARCHAR(255),
        github VARCHAR(500),
        twitter VARCHAR(500),
        linkedin VARCHAR(500),
        author VARCHAR(100) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT single_about_me CHECK (id = 1)
      )
    `,
  });
}
