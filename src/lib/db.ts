import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL;
    const supabaseKey = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_STORAGE_SUPABASE_URL and STORAGE_SUPABASE_SERVICE_ROLE_KEY must be set'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}
