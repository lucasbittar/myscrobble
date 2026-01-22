import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { sendAccessGrantedEmail } from '@/lib/email';

const ADMIN_EMAIL = 'lucasbittar.magnani@gmail.com';

// GET: Fetch all waitlist entries (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Get all waitlist entries sorted by created_at
    const { data: entries, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching waitlist:', error);
      return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
    }

    // Get stats
    const total = entries?.length || 0;
    const converted = entries?.filter((e: { converted_at: string | null }) => e.converted_at).length || 0;
    const pending = total - converted;

    return NextResponse.json({
      entries: entries || [],
      stats: {
        total,
        converted,
        pending,
      },
    });
  } catch (error) {
    console.error('Admin waitlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Mark entry as converted (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing entry ID' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    if (action === 'convert') {
      // First, get the user's email, name, and locale
      const { data: entry } = await supabase
        .from('waitlist')
        .select('email, spotify_name, locale')
        .eq('id', id)
        .single();

      // Mark as converted
      const { error } = await supabase
        .from('waitlist')
        .update({ converted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error converting entry:', error);
        return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
      }

      // Send access granted email (don't await to not block the response)
      if (entry?.email) {
        const locale = entry.locale === 'pt-BR' ? 'pt-BR' : 'en';
        sendAccessGrantedEmail({
          to: entry.email,
          name: entry.spotify_name || undefined,
          locale,
        }).catch((err) => console.error('Failed to send access granted email:', err));
      }

      return NextResponse.json({ success: true, action: 'converted' });
    } else if (action === 'unconvert') {
      // Remove converted status
      const { error } = await supabase
        .from('waitlist')
        .update({ converted_at: null })
        .eq('id', id);

      if (error) {
        console.error('Error unconverting entry:', error);
        return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'unconverted' });
    } else if (action === 'delete') {
      // Delete entry
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting entry:', error);
        return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin waitlist patch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
