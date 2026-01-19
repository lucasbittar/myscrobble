import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient } from '@/lib/spotify';

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

    const spotify = createSpotifyClient(session.accessToken);
    const topTracks = await spotify.getTopTracks(timeRange, Math.min(limit, 50));

    return NextResponse.json(topTracks);
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch top tracks' }, { status: 500 });
  }
}
