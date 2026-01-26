import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { ReactElement } from 'react';
import {
  ShareCardType,
  ShareColorTheme,
  DashboardShareData,
  HistoryShareData,
  TopChartsShareData,
  ConcertsShareData,
  SonicAuraShareData,
  PodcastsShareData,
  shareColorThemes,
  cardTypeToTheme,
} from '@/components/share/share-types';
import { SatoriDashboardCard } from '@/components/share/satori/SatoriDashboardCard';
import { SatoriHistoryCard } from '@/components/share/satori/SatoriHistoryCard';
import { SatoriTopChartsCard } from '@/components/share/satori/SatoriTopChartsCard';
import { SatoriConcertsCard } from '@/components/share/satori/SatoriConcertsCard';
import { SatoriSonicAuraCard } from '@/components/share/satori/SatoriSonicAuraCard';
import { SatoriPodcastsCard } from '@/components/share/satori/SatoriPodcastsCard';

export const runtime = 'edge';

// Map card types to pre-generated background image filenames
function getBackgroundImageFilename(type: ShareCardType, data?: SonicAuraShareData): string {
  switch (type) {
    case 'dashboard':
      return 'bg-share-card-dashboard.png';
    case 'history':
      return 'bg-share-card-history.png';
    case 'top-charts':
      return 'bg-share-card-top.png';
    case 'concerts':
      return 'bg-share-card-concerts.png';
    case 'podcasts':
      return 'bg-share-card-podcasts.png';
    case 'sonic-aura':
      if (data?.moodColor) {
        return `bg-share-card-aura-${data.moodColor}.png`;
      }
      return 'bg-share-card-aura-energetic.png';
    default:
      return 'bg-share-card-dashboard.png';
  }
}

// Helper to convert ArrayBuffer to base64 (Edge-compatible, no Node.js Buffer)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to fetch an image and convert to base64 data URL
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'image/*' },
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to fetch image:', url, error);
    return null;
  }
}

// Process data to convert all image URLs to data URLs
async function processImagesInData<T>(data: T): Promise<T> {
  if (!data || typeof data !== 'object') return data;

  const processedData = JSON.parse(JSON.stringify(data)) as T;

  // Collect all image URLs and their references for batch fetching
  const imagePromises: Promise<void>[] = [];

  // Helper to process an object and its nested properties
  function processObject(obj: Record<string, unknown>) {
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      // Check for image URL properties
      if ((key === 'image' || key === 'artistImage') && typeof value === 'string' && value.startsWith('http')) {
        const url = value;
        imagePromises.push(
          fetchImageAsDataUrl(url).then(dataUrl => {
            if (dataUrl) {
              obj[key] = dataUrl;
            }
          })
        );
      } else if (Array.isArray(value)) {
        // Process array items
        for (const item of value) {
          if (item && typeof item === 'object') {
            processObject(item as Record<string, unknown>);
          }
        }
      } else if (value && typeof value === 'object') {
        // Process nested objects
        processObject(value as Record<string, unknown>);
      }
    }
  }

  processObject(processedData as Record<string, unknown>);

  // Wait for all image fetches to complete
  await Promise.all(imagePromises);

  return processedData;
}

// Translation strings for both locales
const translations = {
  en: {
    nowPlaying: 'Now Playing',
    myStats: 'My Stats',
    timeListened: 'Time Listened',
    tracksPlayed: 'Tracks Played',
    artists: 'Artists',
    recentVibes: 'My Recent Vibes',
    tracksRecently: 'tracks recently',
    topArtists: 'My Top Artists',
    topTracks: 'My Top Tracks',
    topAlbums: 'My Top Albums',
    nextShow: 'My Next Show',
    today: 'Today!',
    tomorrow: 'Tomorrow!',
    inDays: 'In {days} days',
    moreShows: 'more shows',
    noConcerts: 'No upcoming concerts',
    sonicAura: 'My Sonic Aura',
    myPodcasts: 'My Podcasts',
    episodes: 'episodes',
    shows: 'Shows',
    savedEpisodes: 'Saved Episodes',
  },
  'pt-BR': {
    nowPlaying: 'Ouvindo Agora',
    myStats: 'Minhas Estatísticas',
    timeListened: 'Tempo Ouvindo',
    tracksPlayed: 'Músicas',
    artists: 'Artistas',
    recentVibes: 'Minhas Vibes Recentes',
    tracksRecently: 'músicas recentemente',
    topArtists: 'Meus Top Artistas',
    topTracks: 'Minhas Top Músicas',
    topAlbums: 'Meus Top Álbuns',
    nextShow: 'Meu Próximo Show',
    today: 'Hoje!',
    tomorrow: 'Amanhã!',
    inDays: 'Em {days} dias',
    moreShows: 'mais shows',
    noConcerts: 'Nenhum show próximo',
    sonicAura: 'Minha Aura Sônica',
    myPodcasts: 'Meus Podcasts',
    episodes: 'episódios',
    shows: 'Shows',
    savedEpisodes: 'Episódios Salvos',
  },
};

type LocaleKey = keyof typeof translations;
type TranslationKey = keyof typeof translations.en;

interface GenerateRequest {
  type: ShareCardType;
  theme?: ShareColorTheme;
  locale?: LocaleKey;
  data:
    | DashboardShareData
    | HistoryShareData
    | TopChartsShareData
    | ConcertsShareData
    | SonicAuraShareData
    | PodcastsShareData;
}

export async function POST(request: NextRequest) {
  try {
    // Note: No auth check here - this endpoint only renders images from
    // data the user already has in their browser, and doesn't make
    // expensive external API calls. User interaction is required to trigger it.
    const body: GenerateRequest = await request.json();
    console.log('[share/generate] Request received:', { type: body.type, theme: body.theme, locale: body.locale });

    const { type, locale = 'en' } = body;
    const theme = body.theme || cardTypeToTheme[type];
    const colors = shareColorThemes[theme];
    const t = translations[locale] || translations.en;

    // Fetch the pre-generated background image
    const bgFilename = getBackgroundImageFilename(type, type === 'sonic-aura' ? body.data as SonicAuraShareData : undefined);
    const origin = new URL(request.url).origin;
    const bgImageUrl = `${origin}/share-images/${bgFilename}`;
    const backgroundImage = await fetchImageAsDataUrl(bgImageUrl);
    console.log('[share/generate] Background image:', { bgFilename, loaded: !!backgroundImage });

    // Process images - fetch and convert to base64 data URLs for reliable rendering
    const data = await processImagesInData(body.data);

    // Helper to interpolate translation strings
    const formatT = (key: TranslationKey, params?: Record<string, string | number>) => {
      let str = t[key];
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }
      return str;
    };

    let cardElement: ReactElement;

    switch (type) {
      case 'dashboard':
        cardElement = (
          <SatoriDashboardCard
            data={data as DashboardShareData}
            colors={colors}
            backgroundImage={backgroundImage || undefined}
            t={{
              nowPlaying: t.nowPlaying,
              myStats: t.myStats,
              timeListened: t.timeListened,
              tracksPlayed: t.tracksPlayed,
              artists: t.artists,
            }}
          />
        );
        break;

      case 'history':
        cardElement = (
          <SatoriHistoryCard
            data={data as HistoryShareData}
            colors={colors}
            backgroundImage={backgroundImage || undefined}
            t={{
              recentVibes: t.recentVibes,
              tracksRecently: t.tracksRecently,
            }}
          />
        );
        break;

      case 'top-charts':
        const topData = data as TopChartsShareData;
        const titleKey =
          topData.type === 'artists'
            ? 'topArtists'
            : topData.type === 'tracks'
              ? 'topTracks'
              : 'topAlbums';
        cardElement = (
          <SatoriTopChartsCard
            data={topData}
            colors={colors}
            backgroundImage={backgroundImage || undefined}
            t={{
              title: t[titleKey as TranslationKey],
            }}
          />
        );
        break;

      case 'concerts':
        const concertsData = data as ConcertsShareData;
        let daysText = '';
        if (concertsData.nextConcert) {
          const { daysUntil } = concertsData.nextConcert;
          if (daysUntil === 0) {
            daysText = t.today;
          } else if (daysUntil === 1) {
            daysText = t.tomorrow;
          } else {
            daysText = formatT('inDays', { days: daysUntil });
          }
        }
        cardElement = (
          <SatoriConcertsCard
            data={concertsData}
            colors={colors}
            backgroundImage={backgroundImage || undefined}
            locale={locale}
            t={{
              nextShow: t.nextShow,
              daysText,
              moreShows: t.moreShows,
              noConcerts: t.noConcerts,
            }}
          />
        );
        break;

      case 'sonic-aura':
        cardElement = (
          <SatoriSonicAuraCard
            data={data as SonicAuraShareData}
            backgroundImage={backgroundImage || undefined}
            t={{
              sonicAura: t.sonicAura,
            }}
          />
        );
        break;

      case 'podcasts':
        cardElement = (
          <SatoriPodcastsCard
            data={data as PodcastsShareData}
            colors={colors}
            backgroundImage={backgroundImage || undefined}
            t={{
              myPodcasts: t.myPodcasts,
              episodes: t.episodes,
              shows: t.shows,
              savedEpisodes: t.savedEpisodes,
            }}
          />
        );
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid card type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new ImageResponse(cardElement, {
      width: 1080,
      height: 1920,
    });
  } catch (error) {
    console.error('Error generating share image:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate image', details: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
