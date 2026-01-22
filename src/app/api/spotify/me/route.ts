import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient, SpotifyApiError } from '@/lib/spotify';

export async function GET() {
  // TEMP: Simulate quota exceeded for testing waitlist
  // Remove this block after testing
  const SIMULATE_QUOTA_EXCEEDED = false;
  if (SIMULATE_QUOTA_EXCEEDED) {
    return NextResponse.json(
      { error: 'Spotify API quota exceeded', isQuotaExceeded: true },
      { status: 403 }
    );
  }

  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spotify = createSpotifyClient(session.accessToken);
    const user = await spotify.getCurrentUser();

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);

    // Pass through 403 errors (quota exceeded) so the client can detect them
    if (error instanceof SpotifyApiError && error.status === 403) {
      return NextResponse.json(
        { error: 'Spotify API quota exceeded', isQuotaExceeded: true },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
