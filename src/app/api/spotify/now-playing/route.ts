import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient } from '@/lib/spotify';

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spotify = createSpotifyClient(session.accessToken);
    const nowPlaying = await spotify.getCurrentlyPlaying();

    if (!nowPlaying) {
      return NextResponse.json({ is_playing: false, item: null });
    }

    return NextResponse.json(nowPlaying);
  } catch (error) {
    console.error('Error fetching now playing:', error);
    return NextResponse.json({ is_playing: false, item: null });
  }
}
