import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

// POST: Update user's last_active_at timestamp (or create user if they don't exist)
export async function POST() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Upsert user - create if doesn't exist, update if exists
    // This ensures users appear in the admin panel as soon as they log in
    const { error } = await supabase
      .from('users')
      .upsert(
        {
          spotify_id: session.user.id,
          display_name: session.user.name,
          email: session.user.email,
          avatar_url: session.user.image,
          last_active_at: new Date().toISOString(),
          is_active: true,
        },
        {
          onConflict: 'spotify_id',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error('Error upserting user activity:', error);
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
