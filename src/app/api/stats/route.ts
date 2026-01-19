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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const supabase = createServerClient();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('spotify_id', session.user.id)
      .single();

    if (!user) {
      return NextResponse.json({
        total_tracks: 0,
        total_minutes: 0,
        unique_artists: 0,
        unique_tracks: 0,
        top_artists: [],
        top_tracks: [],
        listening_by_hour: [],
        listening_by_day: [],
      });
    }

    // Build base query filter
    const userId = (user as { id: string }).id;
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `and played_at >= '${startDate}' and played_at <= '${endDate}'`;
    } else if (startDate) {
      dateFilter = `and played_at >= '${startDate}'`;
    } else if (endDate) {
      dateFilter = `and played_at <= '${endDate}'`;
    }

    // Get basic stats using raw query for aggregations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: basicStats } = await (supabase as any).rpc('get_user_stats', {
      p_user_id: userId,
      p_start_date: startDate || '1970-01-01',
      p_end_date: endDate || '2100-01-01',
    }).single();

    // If RPC doesn't exist, fall back to manual queries
    if (!basicStats) {
      // Get all history for the period
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let historyQuery = (supabase as any)
        .from('listening_history')
        .select('*')
        .eq('user_id', userId);

      if (startDate) {
        historyQuery = historyQuery.gte('played_at', startDate);
      }
      if (endDate) {
        historyQuery = historyQuery.lte('played_at', endDate);
      }

      const { data: history } = await historyQuery;
      const items = history || [];

      // Calculate stats manually
      const totalTracks = items.length;
      const totalMinutes = items.reduce((acc: number, item: { duration_ms: number }) =>
        acc + (item.duration_ms || 0), 0) / 1000 / 60;

      const uniqueArtists = new Set(items.map((item: { artist_id: string }) => item.artist_id)).size;
      const uniqueTracks = new Set(items.map((item: { track_id: string }) => item.track_id)).size;

      // Top artists
      const artistCounts: Record<string, { name: string; count: number; minutes: number }> = {};
      items.forEach((item: { artist_id: string; artist_name: string; duration_ms: number }) => {
        if (!artistCounts[item.artist_id]) {
          artistCounts[item.artist_id] = { name: item.artist_name, count: 0, minutes: 0 };
        }
        artistCounts[item.artist_id].count++;
        artistCounts[item.artist_id].minutes += (item.duration_ms || 0) / 1000 / 60;
      });
      const topArtists = Object.entries(artistCounts)
        .map(([id, data]) => ({ artist_id: id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top tracks
      const trackCounts: Record<string, { name: string; artist: string; album_art: string | null; count: number }> = {};
      items.forEach((item: { track_id: string; track_name: string; artist_name: string; album_art_url: string | null }) => {
        if (!trackCounts[item.track_id]) {
          trackCounts[item.track_id] = {
            name: item.track_name,
            artist: item.artist_name,
            album_art: item.album_art_url,
            count: 0
          };
        }
        trackCounts[item.track_id].count++;
      });
      const topTracks = Object.entries(trackCounts)
        .map(([id, data]) => ({ track_id: id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Listening by hour
      const hourCounts: Record<number, number> = {};
      items.forEach((item: { played_at: string }) => {
        const hour = new Date(item.played_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const listeningByHour = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: hourCounts[i] || 0,
      }));

      // Listening by day of week
      const dayCounts: Record<number, number> = {};
      items.forEach((item: { played_at: string }) => {
        const day = new Date(item.played_at).getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const listeningByDay = dayNames.map((name, i) => ({
        day: name,
        count: dayCounts[i] || 0,
      }));

      return NextResponse.json({
        total_tracks: totalTracks,
        total_minutes: Math.round(totalMinutes),
        unique_artists: uniqueArtists,
        unique_tracks: uniqueTracks,
        top_artists: topArtists,
        top_tracks: topTracks,
        listening_by_hour: listeningByHour,
        listening_by_day: listeningByDay,
      });
    }

    return NextResponse.json(basicStats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
