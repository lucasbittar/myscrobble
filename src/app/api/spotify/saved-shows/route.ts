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
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const spotify = createSpotifyClient(session.accessToken);
    const savedShows = await spotify.getSavedShows(Math.min(limit, 50), offset);

    return NextResponse.json(savedShows);
  } catch (error) {
    console.error('Error fetching saved shows:', error);
    return NextResponse.json({ error: 'Failed to fetch saved shows' }, { status: 500 });
  }
}
