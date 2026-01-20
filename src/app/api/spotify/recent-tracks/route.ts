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
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const spotify = createSpotifyClient(session.accessToken);
    const recentTracks = await spotify.getRecentlyPlayed(Math.min(limit, 50));

    return NextResponse.json(recentTracks);
  } catch (error) {
    console.error('Error fetching recent tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch recent tracks' }, { status: 500 });
  }
}
