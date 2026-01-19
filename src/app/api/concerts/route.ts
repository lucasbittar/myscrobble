import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSpotifyClient } from '@/lib/spotify';

const BANDSINTOWN_API = 'https://rest.bandsintown.com';

interface BandsintownEvent {
  id: string;
  artist_id: string;
  url: string;
  on_sale_datetime: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    region: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  lineup: string[];
  offers: Array<{
    type: string;
    url: string;
    status: string;
  }>;
}

async function getArtistEvents(artistName: string): Promise<BandsintownEvent[]> {
  const appId = process.env.BANDSINTOWN_APP_ID;
  if (!appId) return [];

  try {
    const encodedName = encodeURIComponent(artistName);
    const res = await fetch(
      `${BANDSINTOWN_API}/artists/${encodedName}/events?app_id=${appId}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.BANDSINTOWN_APP_ID) {
      return NextResponse.json({
        concerts: [],
        artists: [],
        error: 'Bandsintown API key not configured',
      });
    }

    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    // Get user's top artists
    const spotify = createSpotifyClient(session.accessToken);
    const topArtists = await spotify.getTopArtists('medium_term', 10);

    if (!topArtists.items || topArtists.items.length === 0) {
      return NextResponse.json({
        concerts: [],
        artists: [],
      });
    }

    const artistNames = topArtists.items.map((a) => a.name);

    // Fetch events for each artist
    const eventPromises = artistNames.map((name) => getArtistEvents(name));
    const allEventsArrays = await Promise.all(eventPromises);

    // Flatten and format events
    let concerts = allEventsArrays
      .flatMap((events, index) =>
        events.map((event) => ({
          id: event.id,
          artist: artistNames[index],
          venue: event.venue,
          datetime: event.datetime,
          url: event.url,
          lineup: event.lineup,
        }))
      )
      .filter((event) => new Date(event.datetime) > new Date()) // Only future events
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    // Filter by location if provided
    if (location) {
      const locationLower = location.toLowerCase();
      concerts = concerts.filter(
        (c) =>
          c.venue.city.toLowerCase().includes(locationLower) ||
          c.venue.region?.toLowerCase().includes(locationLower) ||
          c.venue.country.toLowerCase().includes(locationLower)
      );
    }

    // Limit to 20 concerts
    concerts = concerts.slice(0, 20);

    return NextResponse.json({
      concerts,
      artists: artistNames,
    });
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch concerts' },
      { status: 500 }
    );
  }
}
