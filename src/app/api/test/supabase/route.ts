import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    // Test 1: Create Supabase client
    const supabase = createServerClient();
    results.clientCreated = true;

    // Test 2: Check tables exist by querying them
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    results.usersTable = {
      exists: !usersError,
      error: usersError?.message,
    };

    const { data: historyData, error: historyError } = await supabase
      .from('listening_history')
      .select('count')
      .limit(1);

    results.listeningHistoryTable = {
      exists: !historyError,
      error: historyError?.message,
    };

    const { data: recsData, error: recsError } = await supabase
      .from('recommendations')
      .select('count')
      .limit(1);

    results.recommendationsTable = {
      exists: !recsError,
      error: recsError?.message,
    };

    // Test 3: Try to sync current user if logged in
    const session = await getSession();
    if (session?.user) {
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('spotify_id', session.user.id)
        .single();

      if (findError && findError.code === 'PGRST116') {
        // User not found, create them
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newUser, error: createError } = await (supabase as any)
          .from('users')
          .insert({
            spotify_id: session.user.id,
            display_name: session.user.name,
            email: session.user.email,
            avatar_url: session.user.image,
            last_synced_at: new Date().toISOString(),
          })
          .select()
          .single();

        results.userSync = {
          action: 'created',
          success: !createError,
          user: newUser,
          error: createError?.message,
        };
      } else if (existingUser) {
        results.userSync = {
          action: 'found',
          success: true,
          user: existingUser,
        };
      } else {
        results.userSync = {
          action: 'error',
          success: false,
          error: findError?.message,
        };
      }
    } else {
      results.userSync = {
        action: 'skipped',
        reason: 'No active session',
      };
    }

    results.success = true;
    return NextResponse.json(results);
  } catch (error) {
    results.success = false;
    results.error = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(results, { status: 500 });
  }
}
