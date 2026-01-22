import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getSession } from '@/lib/session';
import { createSpotifyClient } from '@/lib/spotify';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Mood color mapping
type MoodColor = 'energetic' | 'chill' | 'melancholic' | 'nostalgic' | 'experimental';

interface MoodAnalysis {
  moodSentence: string;
  moodTags: string[];
  moodColor: MoodColor;
  suggestions: string[];
  emoji: string;
}

// Helper function to detect locale
async function detectLocale(): Promise<string> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  if (localeCookie && ['en', 'pt-BR'].includes(localeCookie)) {
    return localeCookie;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  if (acceptLanguage.toLowerCase().includes('pt')) {
    return 'pt-BR';
  }

  return 'en';
}

// In-memory cache for mood analysis (per user)
const moodCache = new Map<string, { data: MoodAnalysis; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

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
    const userId = session.user.id;

    // Detect user's locale early for cache key
    const locale = await detectLocale();
    const cacheKey = `${userId}:${locale}`;

    // Check cache (locale-aware)
    if (!forceRefresh) {
      const cached = moodCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return NextResponse.json({
          ...cached.data,
          cached: true,
          generatedAt: new Date(cached.timestamp).toISOString(),
        });
      }
    }

    // Get user's listening data
    const spotify = createSpotifyClient(session.accessToken);

    // Fetch data in parallel
    const [topArtistsResponse, topTracksResponse] = await Promise.all([
      spotify.getTopArtists('short_term', 15),
      spotify.getTopTracks('short_term', 20),
    ]);

    const topArtists = topArtistsResponse.items || [];
    const topTracks = topTracksResponse.items || [];

    if (topArtists.length === 0 && topTracks.length === 0) {
      return NextResponse.json(
        { error: 'Not enough listening data' },
        { status: 400 }
      );
    }

    // Extract genres
    const allGenres = topArtists.flatMap((a) => a.genres);
    const genreCounts = allGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([genre]) => genre);

    // Use detected locale (already fetched for cache key)
    const isPortuguese = locale === 'pt-BR';

    // Generate mood analysis using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const artistsList = topArtists.map((a) => a.name).join(', ');
    const genresList = topGenres.join(', ');

    const moodTagsExample = isPortuguese
      ? 'nostálgico, introspectivo, noturno, energético, sonhador'
      : 'nostalgic, introspective, night owl, energetic, dreamy';

    const suggestionsExample = isPortuguese
      ? 'Uma playlist para dias chuvosos, Descobrir artistas de shoegaze, Sessões de lo-fi à noite'
      : 'A rainy day playlist, Discovering shoegaze artists, Late-night lo-fi sessions';

    const mainInstruction = isPortuguese
      ? `O que você diria em algumas frases (máximo 2) para uma pessoa que está ouvindo esses artistas nas últimas 4 semanas? Dê conselhos, sugestões, palavras de sabedoria ou uma piada engraçada baseada no gosto musical dela. Seja espirituoso, pessoal e divertido - como um amigo que manja de música zoando ela com carinho.

IMPORTANTE: Responda inteiramente em Português do Brasil.`
      : `What would you say in a couple of sentences (2 max) to a person that has been listening to these artists for the last 4 weeks? Give them advice, suggestions, words of wisdom, or a funny joke based on their music taste. Be witty, personal, and playful - like a friend who knows music well roasting them affectionately.

Respond in English.`;

    const moodSentenceInstruction = isPortuguese
      ? 'Seu comentário espirituoso de 1-2 frases curtas (MÁXIMO 205 CARACTERES), conselho ou piada sobre o gosto musical. Use segunda pessoa (você). Seja específico sobre os artistas/gêneros. Pode ser engraçado, perspicaz ou ambos.'
      : 'Your 1-2 sentence witty comment, advice, or joke about their music taste (MAXIMUM 205 CHARACTERS). Use second person (you/your). Be specific about the artists/genres they listen to. Can be funny, insightful, or both.';

    const closingInstruction = isPortuguese
      ? `Seja criativo e específico - mencione os artistas/gêneros reais. Não seja genérico ou corporativo.
Responda apenas com JSON válido, sem texto adicional.`
      : `Be creative and specific - reference their actual artists/genres. Don't be generic or corporate-sounding.
Only respond with valid JSON, no additional text.`;

    const prompt = `${mainInstruction}

Artists: ${artistsList}
Genres: ${genresList}

Respond with a JSON object:

{
  "moodSentence": "${moodSentenceInstruction}",
  "moodTags": ["3-4 words describing their vibe, like: ${moodTagsExample}"],
  "moodColor": "one of: energetic (upbeat/dance), chill (relaxed/ambient), melancholic (emotional/sad), nostalgic (retro/sentimental), experimental (eclectic/varied)",
  "suggestions": ["3 short activity/playlist suggestions based on their vibe. Example: ${suggestionsExample}"],
  "emoji": "single emoji that captures their vibe"
}

${closingInstruction}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let moodAnalysis: MoodAnalysis;
    try {
      let cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

      // Fix common JSON issues
      const openBraces = (cleanedText.match(/\{/g) || []).length;
      const closeBraces = (cleanedText.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        cleanedText += '}'.repeat(openBraces - closeBraces);
      }
      cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1');

      moodAnalysis = JSON.parse(cleanedText);
    } catch {
      console.error('Failed to parse Gemini mood response:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Validate moodColor
    const validMoodColors: MoodColor[] = ['energetic', 'chill', 'melancholic', 'nostalgic', 'experimental'];
    if (!validMoodColors.includes(moodAnalysis.moodColor)) {
      moodAnalysis.moodColor = 'nostalgic'; // Default fallback
    }

    // Ensure arrays exist
    moodAnalysis.moodTags = moodAnalysis.moodTags || [];
    moodAnalysis.suggestions = moodAnalysis.suggestions || [];

    // Enforce 205 character limit on moodSentence
    if (moodAnalysis.moodSentence && moodAnalysis.moodSentence.length > 205) {
      moodAnalysis.moodSentence = moodAnalysis.moodSentence.substring(0, 202) + '...';
    }

    // Cache the result (locale-aware)
    const generatedAt = new Date().toISOString();
    moodCache.set(cacheKey, {
      data: moodAnalysis,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      ...moodAnalysis,
      cached: false,
      generatedAt,
    });
  } catch (error) {
    console.error('Error generating mood analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate mood analysis' },
      { status: 500 }
    );
  }
}
