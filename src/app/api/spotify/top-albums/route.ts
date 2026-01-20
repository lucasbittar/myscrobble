import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient } from '@/lib/spotify';

interface AlbumCount {
  id: string;
  name: string;
  artist: string;
  image?: string;
  spotifyUrl: string;
  trackCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('time_range') || 'medium_term';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const spotify = createSpotifyClient(session.accessToken);

    // Fetch more tracks to get better album aggregation
    const topTracks = await spotify.getTopTracks(
      timeRange as 'short_term' | 'medium_term' | 'long_term',
      50
    );

    // Aggregate tracks by album
    const albumMap = new Map<string, AlbumCount>();

    for (const track of topTracks.items) {
      const albumId = track.album.id;

      if (albumMap.has(albumId)) {
        const existing = albumMap.get(albumId)!;
        existing.trackCount++;
      } else {
        albumMap.set(albumId, {
          id: albumId,
          name: track.album.name,
          artist: track.artists.map(a => a.name).join(', '),
          image: track.album.images[0]?.url,
          spotifyUrl: `https://open.spotify.com/album/${albumId}`,
          trackCount: 1,
        });
      }
    }

    // Sort by track count and return top albums
    const topAlbums = Array.from(albumMap.values())
      .sort((a, b) => b.trackCount - a.trackCount)
      .slice(0, limit);

    return NextResponse.json({ items: topAlbums });
  } catch (error) {
    console.error('Error fetching top albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top albums' },
      { status: 500 }
    );
  }
}
