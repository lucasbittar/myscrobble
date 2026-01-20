'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { GlowText, TerminalCard, TerminalButton } from '@/components/crt';
import { useTranslations } from 'next-intl';
import { getLargestImage } from '@/lib/spotify';

type Template = 'topArtist' | 'top5Artists' | 'topTrack' | 'stats' | 'topPodcast' | 'top5Podcasts';
type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface ShareData {
  topArtists: Array<{ name: string; image: string }>;
  topTracks: Array<{ name: string; artist: string; image: string }>;
  topPodcasts: Array<{ name: string; publisher: string; image: string }>;
  stats: {
    uniqueArtists: number;
    uniqueTracks: number;
    totalTracks: number;
    totalMinutes: number;
  };
  userName: string;
}

// Calculate date range based on time range
function getDateRange(timeRange: TimeRange): { start_date?: string } {
  const now = new Date();
  switch (timeRange) {
    case 'short_term':
      return { start_date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString() };
    case 'medium_term':
      return { start_date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString() };
    default:
      return {};
  }
}

async function fetchShareData(timeRange: TimeRange): Promise<ShareData> {
  const dateRange = getDateRange(timeRange);
  const statsParams = new URLSearchParams();
  if (dateRange.start_date) statsParams.set('start_date', dateRange.start_date);

  const [artistsRes, tracksRes, userRes, statsRes, podcastsRes] = await Promise.all([
    fetch(`/api/spotify/top-artists?time_range=${timeRange}&limit=5`),
    fetch(`/api/spotify/top-tracks?time_range=${timeRange}&limit=5`),
    fetch('/api/spotify/me'),
    fetch(`/api/stats?${statsParams.toString()}`),
    fetch('/api/spotify/saved-shows?limit=5'),
  ]);

  const [artists, tracks, user, stats, podcasts] = await Promise.all([
    artistsRes.ok ? artistsRes.json() : { items: [] },
    tracksRes.ok ? tracksRes.json() : { items: [] },
    userRes.ok ? userRes.json() : { display_name: 'User' },
    statsRes.ok ? statsRes.json() : null,
    podcastsRes.ok ? podcastsRes.json() : { items: [] },
  ]);

  return {
    topArtists: (artists.items || []).map((a: { name: string; images: { url: string }[] }) => ({
      name: a.name,
      image: a.images[0]?.url || '',
    })),
    topTracks: (tracks.items || []).map((t: { name: string; artists: { name: string }[]; album: { images: { url: string }[] } }) => ({
      name: t.name,
      artist: t.artists[0]?.name || '',
      image: t.album.images[0]?.url || '',
    })),
    topPodcasts: (podcasts.items || []).map((item: { show: { name: string; publisher: string; images: { url: string; width?: number; height?: number }[] } }) => ({
      name: item.show.name,
      publisher: item.show.publisher,
      image: getLargestImage(item.show.images) || '',
    })),
    stats: {
      uniqueArtists: stats?.unique_artists || artists.items?.length || 0,
      uniqueTracks: stats?.unique_tracks || tracks.items?.length || 0,
      totalTracks: stats?.total_tracks || 0,
      totalMinutes: stats?.total_minutes || 0,
    },
    userName: user.display_name || 'User',
  };
}

export default function SharePage() {
  const [template, setTemplate] = useState<Template>('topArtist');
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const cardRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('share');
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  // Create templates and timeRangeLabels from translations
  const templates: Record<Template, string> = {
    topArtist: t('templates.topArtist'),
    top5Artists: t('templates.top5Artists'),
    topTrack: t('templates.topTrack'),
    stats: t('templates.statsCard'),
    topPodcast: t('templates.topPodcast'),
    top5Podcasts: t('templates.top5Podcasts'),
  };

  const timeRangeLabels: Record<TimeRange, string> = {
    short_term: tDashboard('timeRanges.short'),
    medium_term: tDashboard('timeRanges.medium'),
    long_term: tDashboard('timeRanges.long'),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['share-data', timeRange],
    queryFn: () => fetchShareData(timeRange),
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      // Create a high-resolution canvas for Instagram Stories (1080x1920)
      const scale = 3; // Higher scale for better quality
      const canvas = await html2canvas(cardRef.current, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a0a0a',
        width: 360,
        height: 640,
      });

      // Create a new canvas at Instagram Story resolution
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = 1080;
      finalCanvas.height = 1920;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        // Fill with background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 1080, 1920);

        // Draw the captured content scaled to fit
        ctx.drawImage(canvas, 0, 0, 1080, 1920);

        // Convert to blob and download
        finalCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `myscrobble-${template}-${timeRange}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [template, timeRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-terminal text-3xl">
          <GlowText color="phosphor" size="sm">
            <span className="text-[#888888]">◫</span> {t('title')}
          </GlowText>
        </h1>
        <p className="mt-1 font-mono text-sm text-[#888888]">
          {t('subtitle')}
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Template Selector */}
          <TerminalCard title={t('templates.title')}>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(templates) as Template[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`cursor-pointer rounded-md border p-3 text-left font-terminal text-sm transition-all ${
                    template === t
                      ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)] text-[#00ff41]'
                      : 'border-[rgba(0,255,65,0.2)] text-[#888888] hover:border-[rgba(0,255,65,0.4)]'
                  }`}
                >
                  {templates[t]}
                </button>
              ))}
            </div>
          </TerminalCard>

          {/* Time Range */}
          <TerminalCard title={t('timeRange')}>
            <div className="flex gap-2">
              {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
                <TerminalButton
                  key={range}
                  variant={timeRange === range ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="flex-1"
                >
                  {timeRangeLabels[range]}
                </TerminalButton>
              ))}
            </div>
          </TerminalCard>

          {/* Actions */}
          <div className="flex gap-3">
            <TerminalButton
              onClick={handleDownload}
              glow
              className="flex-1"
              disabled={isLoading || isDownloading}
            >
              {isDownloading ? t('generating') : t('download')}
            </TerminalButton>
          </div>

          <p className="font-mono text-xs text-[#555555]">
            {t('tip')}
          </p>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-3 font-terminal text-sm text-[#888888]">{t('preview')}</p>
          <div className="overflow-hidden rounded-lg border border-[rgba(0,255,65,0.2)]">
            <div
              ref={cardRef}
              className="relative mx-auto"
              style={{
                aspectRatio: '9/16',
                maxWidth: '360px',
                background: 'linear-gradient(180deg, #0a0a0a 0%, #0d1a0d 100%)',
              }}
            >
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="font-terminal text-[#00ff41]">{tCommon('loading')}</p>
                </div>
              ) : data ? (
                <>
                  {template === 'topArtist' && <TopArtistCard data={data} timeRangeLabel={timeRangeLabels[timeRange]} />}
                  {template === 'top5Artists' && <Top5ArtistsCard data={data} timeRangeLabel={timeRangeLabels[timeRange]} />}
                  {template === 'topTrack' && <TopTrackCard data={data} timeRangeLabel={timeRangeLabels[timeRange]} />}
                  {template === 'stats' && <StatsCard data={data} timeRangeLabel={timeRangeLabels[timeRange]} t={t} />}
                  {template === 'topPodcast' && <TopPodcastCard data={data} timeRangeLabel={timeRangeLabels[timeRange]} />}
                  {template === 'top5Podcasts' && <Top5PodcastsCard data={data} timeRangeLabel={timeRangeLabels[timeRange]} />}
                </>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CardWrapper({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="relative flex h-full flex-col p-6">
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,255,65,0.1) 1px, rgba(0,255,65,0.1) 2px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1">{children}</div>

      {/* Footer */}
      <div className="relative z-10 mt-auto pt-4 text-center">
        <p className="font-terminal text-xs text-[#555555]">
          {userName} • MyScrobble.fm
        </p>
      </div>
    </div>
  );
}

function TopArtistCard({ data, timeRangeLabel }: { data: ShareData; timeRangeLabel: string }) {
  const artist = data.topArtists[0];
  if (!artist) return null;

  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-4 font-terminal text-sm text-[#888888]">
          My #1 Artist ({timeRangeLabel})
        </p>
        {artist.image && (
          <div className="mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-[#00ff41] shadow-[0_0_40px_rgba(0,255,65,0.3)]">
            <Image src={artist.image} alt={artist.name} width={160} height={160} className="h-full w-full object-cover" />
          </div>
        )}
        <h2 className="font-terminal text-3xl text-[#00ff41]">{artist.name}</h2>
      </div>
    </CardWrapper>
  );
}

function Top5ArtistsCard({ data, timeRangeLabel }: { data: ShareData; timeRangeLabel: string }) {
  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col">
        <p className="mb-6 text-center font-terminal text-sm text-[#888888]">
          Top 5 Artists ({timeRangeLabel})
        </p>
        <div className="flex-1 space-y-3">
          {data.topArtists.slice(0, 5).map((artist, index) => (
            <div key={artist.name} className="flex items-center gap-3">
              <span className="w-6 text-right font-terminal text-xl text-[#00ff41]">
                {index + 1}
              </span>
              {artist.image && (
                <div className="h-10 w-10 overflow-hidden rounded-full border border-[rgba(0,255,65,0.3)]">
                  <Image src={artist.image} alt={artist.name} width={40} height={40} className="h-full w-full object-cover" />
                </div>
              )}
              <span className="truncate font-terminal text-[#e0e0e0]">{artist.name}</span>
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}

function TopTrackCard({ data, timeRangeLabel }: { data: ShareData; timeRangeLabel: string }) {
  const track = data.topTracks[0];
  if (!track) return null;

  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-4 font-terminal text-sm text-[#888888]">
          My #1 Track ({timeRangeLabel})
        </p>
        {track.image && (
          <div className="mb-6 h-36 w-36 overflow-hidden rounded-lg border-4 border-[#00f5ff] shadow-[0_0_40px_rgba(0,245,255,0.3)]">
            <Image src={track.image} alt={track.name} width={144} height={144} className="h-full w-full object-cover" />
          </div>
        )}
        <h2 className="font-terminal text-2xl text-[#00f5ff]">{track.name}</h2>
        <p className="mt-2 font-mono text-sm text-[#888888]">{track.artist}</p>
      </div>
    </CardWrapper>
  );
}

function StatsCard({ data, timeRangeLabel, t }: { data: ShareData; timeRangeLabel: string; t: ReturnType<typeof useTranslations<'share'>> }) {
  const hours = Math.floor(data.stats.totalMinutes / 60);
  const minutes = data.stats.totalMinutes % 60;
  const hasListeningData = data.stats.totalMinutes > 0 || data.stats.totalTracks > 0;

  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-6 font-terminal text-sm text-[#888888]">
          My Stats ({timeRangeLabel})
        </p>
        <div className="space-y-6">
          {hasListeningData && (
            <>
              <div>
                <p className="font-terminal text-4xl text-[#ffb000]">
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                </p>
                <p className="mt-1 font-mono text-xs text-[#888888]">{t('cards.timeListened')}</p>
              </div>
              <div>
                <p className="font-terminal text-4xl text-[#00ff41]">{data.stats.totalTracks.toLocaleString()}</p>
                <p className="mt-1 font-mono text-xs text-[#888888]">{t('cards.tracksPlayed')}</p>
              </div>
            </>
          )}
          <div className="flex gap-8 justify-center">
            <div>
              <p className="font-terminal text-3xl text-[#00f5ff]">{data.stats.uniqueArtists}</p>
              <p className="mt-1 font-mono text-xs text-[#888888]">{t('cards.artists')}</p>
            </div>
            <div>
              <p className="font-terminal text-3xl text-[#ff00ff]">{data.stats.uniqueTracks}</p>
              <p className="mt-1 font-mono text-xs text-[#888888]">{t('cards.tracks')}</p>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}

function TopPodcastCard({ data, timeRangeLabel }: { data: ShareData; timeRangeLabel: string }) {
  const podcast = data.topPodcasts[0];
  if (!podcast) return null;

  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-4 font-terminal text-sm text-[#888888]">
          My #1 Podcast ({timeRangeLabel})
        </p>
        {podcast.image && (
          <div className="mb-6 h-40 w-40 overflow-hidden rounded-xl border-4 border-[#a855f7] shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <Image src={podcast.image} alt={podcast.name} width={160} height={160} quality={100} className="h-full w-full object-cover" />
          </div>
        )}
        <h2 className="font-terminal text-2xl text-[#a855f7]">{podcast.name}</h2>
        <p className="mt-2 font-mono text-sm text-[#888888]">{podcast.publisher}</p>
      </div>
    </CardWrapper>
  );
}

function Top5PodcastsCard({ data, timeRangeLabel }: { data: ShareData; timeRangeLabel: string }) {
  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col">
        <p className="mb-6 text-center font-terminal text-sm text-[#888888]">
          Top 5 Podcasts ({timeRangeLabel})
        </p>
        <div className="flex-1 space-y-3">
          {data.topPodcasts.slice(0, 5).map((podcast, index) => (
            <div key={podcast.name} className="flex items-center gap-3">
              <span className="w-6 text-right font-terminal text-xl text-[#a855f7]">
                {index + 1}
              </span>
              {podcast.image && (
                <div className="h-10 w-10 overflow-hidden rounded-lg border border-[rgba(168,85,247,0.3)]">
                  <Image src={podcast.image} alt={podcast.name} width={40} height={40} quality={100} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="truncate font-terminal text-sm text-[#e0e0e0] block">{podcast.name}</span>
                <span className="truncate font-mono text-xs text-[#888888] block">{podcast.publisher}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}
