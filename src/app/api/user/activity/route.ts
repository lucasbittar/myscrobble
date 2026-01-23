import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

// POST: Update user's last_active_at timestamp
export async function POST() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Update last_active_at for the current user
    const { error } = await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('spotify_id', session.user.id);

    if (error) {
      console.error('Error updating last_active_at:', error);
      // Don't fail silently - this is non-critical
      return NextResponse.json({ success: true, warning: 'Activity tracking failed' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity tracking error:', error);
    // Return success anyway to not block user experience
    return NextResponse.json({ success: true, warning: 'Activity tracking error' });
  }
}
