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
    const body: GenerateRequest = await request.json();
    console.log('[share/generate] Request received:', { type: body.type, theme: body.theme, locale: body.locale });

    const { type, data, locale = 'en' } = body;
    const theme = body.theme || cardTypeToTheme[type];
    const colors = shareColorThemes[theme];
    const t = translations[locale] || translations.en;

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
