import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const artistId = searchParams.get('artist_id');

    const supabase = createServerClient();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('spotify_id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // Cast user to typed interface for property access
    const typedUser = user as { id: string };

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('listening_history')
      .select('*', { count: 'exact' })
      .eq('user_id', typedUser.id)
      .order('played_at', { ascending: false });

    // Apply filters
    if (startDate) {
      query = query.gte('played_at', startDate);
    }
    if (endDate) {
      query = query.lte('played_at', endDate);
    }
    if (artistId) {
      query = query.eq('artist_id', artistId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: items, error, count } = await query;

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json({
      items: items || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
