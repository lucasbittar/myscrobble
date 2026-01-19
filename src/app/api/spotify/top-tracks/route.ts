import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient } from '@/lib/spotify';
import { createServerClient } from '@/lib/supabase/server';

// Map time_range to days for Supabase query
const timeRangeToDays: Record<string, number> = {
  short_term: 28,    // ~4 weeks
  medium_term: 180,  // ~6 months
  long_term: 365 * 5, // ~5 years (effectively all time)
};

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('time_range') || 'medium_term') as
      | 'short_term'
      | 'medium_term'
      | 'long_term';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const includePlayCounts = searchParams.get('include_play_counts') === 'true';

    const spotify = createSpotifyClient(session.accessToken);
    const topTracks = await spotify.getTopTracks(timeRange, Math.min(limit, 50));

    // If play counts requested, fetch from Supabase
    if (includePlayCounts && topTracks.items?.length > 0) {
      const supabase = createServerClient();

      // Get user
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('spotify_id', session.user.id)
        .single();

      if (user) {
        const days = timeRangeToDays[timeRange] || 180;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        // Get track IDs from Spotify response
        const trackIds = topTracks.items.map((track: { id: string }) => track.id);

        // Query play counts for these tracks
        const { data: playCounts } = await supabase
          .from('listening_history')
          .select('track_id')
          .eq('user_id', (user as { id: string }).id)
          .in('track_id', trackIds)
          .gte('played_at', startDate);

        // Count plays per track
        const playCountMap: Record<string, number> = {};
        if (playCounts) {
          for (const row of playCounts as { track_id: string }[]) {
            playCountMap[row.track_id] = (playCountMap[row.track_id] || 0) + 1;
          }
        }

        // Attach play counts to tracks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topTracks.items = topTracks.items.map((track: any) => ({
          ...track,
          playCount: playCountMap[track.id] || 0,
        }));
      }
    }

    return NextResponse.json(topTracks);
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch top tracks' }, { status: 500 });
  }
}
