import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { sendBouncedEmail } from '@/lib/email';

const ADMIN_EMAIL = 'lucasbittar.magnani@gmail.com';
const SPOTIFY_MAX_USERS = 25;

interface ActiveUser {
  id: string;
  spotify_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  last_active_at: string | null;
  is_active: boolean;
  created_at: string;
}

// GET: Fetch all active users with activity data (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Get all users sorted by last_active_at (most recent first)
    const { data: users, error } = await supabase
      .from('users')
      .select('id, spotify_id, display_name, email, avatar_url, last_active_at, is_active, created_at')
      .order('last_active_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Calculate stats
    const activeUsers = (users as ActiveUser[]).filter((u: ActiveUser) => u.is_active);
    const inactiveUsers = (users as ActiveUser[]).filter((u: ActiveUser) => !u.is_active);

    // Find sleepers (inactive for 7+ days but still marked as active)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sleepers = activeUsers.filter((u: ActiveUser) => {
      if (!u.last_active_at) return false;
      return new Date(u.last_active_at) < sevenDaysAgo;
    });

    return NextResponse.json({
      users: users || [],
      stats: {
        total: users?.length || 0,
        active: activeUsers.length,
        inactive: inactiveUsers.length,
        sleepers: sleepers.length,
        maxUsers: SPOTIFY_MAX_USERS,
        slotsAvailable: SPOTIFY_MAX_USERS - activeUsers.length,
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Bounce or reactivate a user (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    if (action === 'bounce') {
      // First, get the user's email and name for notification
      const { data: user } = await supabase
        .from('users')
        .select('email, display_name')
        .eq('id', id)
        .single();

      // Mark user as inactive
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error bouncing user:', error);
        return NextResponse.json({ error: 'Failed to bounce user' }, { status: 500 });
      }

      // Send bounced email notification (don't await to not block response)
      if (user?.email) {
        // Detect locale from browser or default to English
        // For now, we'll use a simple heuristic based on email domain or default to English
        const locale = user.email?.endsWith('.br') ? 'pt-BR' : 'en';
        sendBouncedEmail({
          to: user.email,
          name: user.display_name || undefined,
          locale: locale as 'en' | 'pt-BR',
        }).catch((err) => console.error('Failed to send bounced email:', err));
      }

      return NextResponse.json({ success: true, action: 'bounced' });
    } else if (action === 'reactivate') {
      // Check if we have slots available
      const { data: activeUsers } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true);

      if (activeUsers && activeUsers.length >= SPOTIFY_MAX_USERS) {
        return NextResponse.json(
          { error: `Cannot reactivate: already at ${SPOTIFY_MAX_USERS} active users` },
          { status: 400 }
        );
      }

      // Reactivate user
      const { error } = await supabase
        .from('users')
        .update({ is_active: true, last_active_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error reactivating user:', error);
        return NextResponse.json({ error: 'Failed to reactivate user' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'reactivated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin users patch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
