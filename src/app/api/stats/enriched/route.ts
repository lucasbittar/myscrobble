import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient, getLargestImage } from '@/lib/spotify';

interface TopArtistStat {
  artist_id: string;
  name: string;
  count: number;
  minutes: number;
}

interface TopTrackStat {
  track_id: string;
  name: string;
  artist: string;
  album_art: string | null;
  count: number;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const artistLimit = parseInt(searchParams.get('artist_limit') || '6', 10);
    const trackLimit = parseInt(searchParams.get('track_limit') || '5', 10);

    const supabase = createServerClient();
    const spotify = createSpotifyClient(session.accessToken);

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

    const userId = (user as { id: string }).id;

    // Build the history query
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

    // Calculate basic stats
    const totalTracks = items.length;
    const totalMinutes = items.reduce(
      (acc: number, item: { duration_ms: number }) => acc + (item.duration_ms || 0),
      0
    ) / 1000 / 60;

    const uniqueArtists = new Set(items.map((item: { artist_id: string }) => item.artist_id)).size;
    const uniqueTracks = new Set(items.map((item: { track_id: string }) => item.track_id)).size;

    // Calculate top artists from listening history
    const artistCounts: Record<string, { name: string; count: number; minutes: number }> = {};
    items.forEach((item: { artist_id: string; artist_name: string; duration_ms: number }) => {
      if (!artistCounts[item.artist_id]) {
        artistCounts[item.artist_id] = { name: item.artist_name, count: 0, minutes: 0 };
      }
      artistCounts[item.artist_id].count++;
      artistCounts[item.artist_id].minutes += (item.duration_ms || 0) / 1000 / 60;
    });
    const topArtistStats: TopArtistStat[] = Object.entries(artistCounts)
      .map(([id, data]) => ({ artist_id: id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, artistLimit);

    // Calculate top tracks from listening history
    const trackCounts: Record<string, { name: string; artist: string; album_art: string | null; count: number }> = {};
    items.forEach((item: { track_id: string; track_name: string; artist_name: string; album_art_url: string | null }) => {
      if (!trackCounts[item.track_id]) {
        trackCounts[item.track_id] = {
          name: item.track_name,
          artist: item.artist_name,
          album_art: item.album_art_url,
          count: 0,
        };
      }
      trackCounts[item.track_id].count++;
    });
    const topTrackStats: TopTrackStat[] = Object.entries(trackCounts)
      .map(([id, data]) => ({ track_id: id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, trackLimit);

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

    // Enrich artists with Spotify metadata
    const artistIds = topArtistStats.map(a => a.artist_id);
    let enrichedArtists: Array<{
      id: string;
      name: string;
      image?: string;
      genres: string[];
      count: number;
      minutes: number;
    }> = [];

    try {
      if (artistIds.length > 0) {
        const { artists: spotifyArtists } = await spotify.getArtists(artistIds);

        // Create a map for quick lookup
        const artistMetadataMap = new Map(
          spotifyArtists
            .filter((a): a is NonNullable<typeof a> => a !== null)
            .map(a => [a.id, a])
        );

        enrichedArtists = topArtistStats.map(stat => {
          const metadata = artistMetadataMap.get(stat.artist_id);
          return {
            id: stat.artist_id,
            name: metadata?.name || stat.name,
            image: metadata ? getLargestImage(metadata.images) : undefined,
            genres: metadata?.genres?.slice(0, 2) || [],
            count: stat.count,
            minutes: Math.round(stat.minutes),
          };
        });
      }
    } catch (spotifyError) {
      console.error('Spotify artist fetch error:', spotifyError);
      // Fallback: return stats without Spotify metadata
      enrichedArtists = topArtistStats.map(stat => ({
        id: stat.artist_id,
        name: stat.name,
        image: undefined,
        genres: [],
        count: stat.count,
        minutes: Math.round(stat.minutes),
      }));
    }

    // Enrich tracks with Spotify metadata
    const trackIds = topTrackStats.map(t => t.track_id);
    let enrichedTracks: Array<{
      id: string;
      name: string;
      artist: string;
      albumArt?: string;
      spotifyUrl: string;
      durationMs: number;
      count: number;
    }> = [];

    try {
      if (trackIds.length > 0) {
        const { tracks: spotifyTracks } = await spotify.getTracks(trackIds);

        // Create a map for quick lookup
        const trackMetadataMap = new Map(
          spotifyTracks
            .filter((t): t is NonNullable<typeof t> => t !== null)
            .map(t => [t.id, t])
        );

        enrichedTracks = topTrackStats.map(stat => {
          const metadata = trackMetadataMap.get(stat.track_id);
          return {
            id: stat.track_id,
            name: metadata?.name || stat.name,
            artist: metadata?.artists?.map(a => a.name).join(', ') || stat.artist,
            albumArt: metadata ? getLargestImage(metadata.album?.images) : stat.album_art || undefined,
            spotifyUrl: metadata?.external_urls?.spotify || `https://open.spotify.com/track/${stat.track_id}`,
            durationMs: metadata?.duration_ms || 0,
            count: stat.count,
          };
        });
      }
    } catch (spotifyError) {
      console.error('Spotify track fetch error:', spotifyError);
      // Fallback: return stats without Spotify metadata
      enrichedTracks = topTrackStats.map(stat => ({
        id: stat.track_id,
        name: stat.name,
        artist: stat.artist,
        albumArt: stat.album_art || undefined,
        spotifyUrl: `https://open.spotify.com/track/${stat.track_id}`,
        durationMs: 0,
        count: stat.count,
      }));
    }

    return NextResponse.json({
      total_tracks: totalTracks,
      total_minutes: Math.round(totalMinutes),
      unique_artists: uniqueArtists,
      unique_tracks: uniqueTracks,
      top_artists: enrichedArtists,
      top_tracks: enrichedTracks,
      listening_by_hour: listeningByHour,
      listening_by_day: listeningByDay,
    });
  } catch (error) {
    console.error('Enriched stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enriched stats' },
      { status: 500 }
    );
  }
}
