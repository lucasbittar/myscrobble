import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

// GET: Check if current user is active
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Get user's active status
    const { data: user, error } = await supabase
      .from('users')
      .select('is_active, last_active_at')
      .eq('spotify_id', session.user.id)
      .single();

    if (error) {
      // If user doesn't exist in DB yet, treat them as active
      // They'll be created on first sync
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          isActive: true,
          lastActiveAt: null,
          isNewUser: true,
        });
      }
      console.error('Error fetching user status:', error);
      return NextResponse.json({ error: 'Failed to fetch user status' }, { status: 500 });
    }

    return NextResponse.json({
      isActive: user.is_active ?? true,
      lastActiveAt: user.last_active_at,
    });
  } catch (error) {
    console.error('User status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
