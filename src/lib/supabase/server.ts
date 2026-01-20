import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Server-side Supabase client (uses service role key for admin operations)
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
