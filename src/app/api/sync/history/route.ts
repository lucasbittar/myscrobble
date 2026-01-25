import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient } from '@/lib/spotify';
import type { NewListeningHistory } from '@/lib/supabase/types';

export async function POST() {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const spotify = createSpotifyClient(session.accessToken);

    // Get or create user in Supabase
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('spotify_id', session.user.id)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User not found, create them
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newUser, error: createError } = await (supabase as any)
        .from('users')
        .insert({
          spotify_id: session.user.id,
          display_name: session.user.name,
          email: session.user.email,
          avatar_url: session.user.image,
          last_synced_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      user = newUser;
    } else if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    } else if (user) {
      // User exists - update their profile info (important for waitlist users who connected later)
      const typedExistingUser = user as { id: string; display_name: string | null; avatar_url: string | null };
      const needsUpdate =
        typedExistingUser.display_name !== session.user.name ||
        typedExistingUser.avatar_url !== session.user.image;

      if (needsUpdate) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: updatedUser } = await (supabase as any)
          .from('users')
          .update({
            display_name: session.user.name,
            email: session.user.email,
            avatar_url: session.user.image,
          })
          .eq('id', typedExistingUser.id)
          .select()
          .single();

        if (updatedUser) {
          user = updatedUser;
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch recent tracks from Spotify (max 50)
    const recentTracks = await spotify.getRecentlyPlayed(50);

    if (!recentTracks?.items?.length) {
      return NextResponse.json({
        message: 'No recent tracks to sync',
        synced: 0,
      });
    }

    // Cast user to typed interface for property access
    const typedUser = user as { id: string; spotify_id: string; display_name: string; last_synced_at: string };

    // Prepare listening history entries
    const historyEntries: NewListeningHistory[] = recentTracks.items.map((item: {
      track: {
        id: string;
        name: string;
        artists: { id: string; name: string }[];
        album: { name: string; images: { url: string }[] };
        duration_ms: number;
      };
      played_at: string;
    }) => ({
      user_id: typedUser.id,
      track_id: item.track.id,
      track_name: item.track.name,
      artist_id: item.track.artists[0]?.id || 'unknown',
      artist_name: item.track.artists.map((a: { name: string }) => a.name).join(', '),
      album_name: item.track.album.name,
      album_art_url: item.track.album.images[0]?.url,
      played_at: item.played_at,
      duration_ms: item.track.duration_ms,
    }));

    // Insert entries, ignoring duplicates (based on user_id, track_id, played_at unique constraint)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertError } = await (supabase as any)
      .from('listening_history')
      .upsert(historyEntries, {
        onConflict: 'user_id,track_id,played_at',
        ignoreDuplicates: true,
      })
      .select();

    if (insertError) {
      console.error('Error inserting history:', insertError);
      return NextResponse.json({ error: 'Failed to sync history' }, { status: 500 });
    }

    // Update user's last_synced_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('users')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', typedUser.id);

    return NextResponse.json({
      message: 'Sync completed',
      synced: inserted?.length || 0,
      total_fetched: recentTracks.items.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('spotify_id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        synced: false,
        message: 'User not synced yet',
      });
    }

    // Cast user to typed interface for property access
    const typedUser = user as { id: string; spotify_id: string; display_name: string; last_synced_at: string };

    // Get history count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from('listening_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', typedUser.id);

    return NextResponse.json({
      synced: true,
      user: {
        id: typedUser.id,
        spotify_id: typedUser.spotify_id,
        display_name: typedUser.display_name,
        last_synced_at: typedUser.last_synced_at,
      },
      history_count: count || 0,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
