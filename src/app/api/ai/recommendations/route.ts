import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createSpotifyClient } from '@/lib/spotify';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const supabase = createServerClient();

    // Check for cached recommendations (valid for 24 hours)
    if (!forceRefresh) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('spotify_id', session.user.id)
        .single();

      if (user) {
        const userId = (user as { id: string }).id;
        const { data: cached } = await supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', userId)
          .gt('expires_at', new Date().toISOString())
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (cached) {
          const cachedData = cached as { content: unknown; generated_at: string };
          return NextResponse.json({
            ...(cachedData.content as object),
            cached: true,
            generatedAt: cachedData.generated_at,
          });
        }
      }
    }

    // Get user's top artists
    const spotify = createSpotifyClient(session.accessToken);
    const topArtists = await spotify.getTopArtists('medium_term', 10);

    if (!topArtists.items || topArtists.items.length === 0) {
      return NextResponse.json(
        { error: 'Not enough listening data' },
        { status: 400 }
      );
    }

    const artistNames = topArtists.items.map((a) => a.name);
    const genres = [...new Set(topArtists.items.flatMap((a) => a.genres))].slice(0, 10);

    // Generate recommendations using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Based on the following music preferences, recommend 5 new artists that the user might enjoy. Be creative and suggest artists they likely haven't heard of yet.

User's top artists: ${artistNames.join(', ')}
Favorite genres: ${genres.join(', ')}

For each recommendation, provide:
1. Artist name
2. A brief reason why they'd like this artist (1-2 sentences, relate to their existing tastes)
3. 2-3 starter songs to check out
4. Main genres

Respond in JSON format exactly like this:
{
  "recommendations": [
    {
      "artist": "Artist Name",
      "reason": "Why they'd enjoy this artist",
      "starterSongs": ["Song 1", "Song 2", "Song 3"],
      "genres": ["genre1", "genre2"]
    }
  ]
}

Only respond with valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let recommendations;
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      recommendations = JSON.parse(cleanedText);
    } catch {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Enrich recommendations with Spotify artist data (images and URLs)
    const enrichedRecommendations = await Promise.all(
      (recommendations.recommendations || []).map(async (rec: { artist: string; reason: string; starterSongs: string[]; genres: string[] }) => {
        try {
          const searchResult = await spotify.searchArtists(rec.artist, 1);
          const foundArtist = searchResult.artists?.items?.[0];
          if (foundArtist) {
            return {
              ...rec,
              imageUrl: foundArtist.images[0]?.url || null,
              spotifyUrl: foundArtist.external_urls?.spotify || null,
              spotifyId: foundArtist.id,
            };
          }
        } catch (error) {
          console.error(`Failed to search for artist ${rec.artist}:`, error);
        }
        return rec;
      })
    );

    // Save recommendations to Supabase cache
    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('spotify_id', session.user.id)
      .single();

    if (user) {
      const userId = (user as { id: string }).id;
      const content = {
        recommendations: enrichedRecommendations,
        basedOn: artistNames.slice(0, 5),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('recommendations').insert({
        user_id: userId,
        content,
        generated_at: generatedAt,
        expires_at: expiresAt,
      });
    }

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      basedOn: artistNames.slice(0, 5),
      generatedAt,
      cached: false,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
