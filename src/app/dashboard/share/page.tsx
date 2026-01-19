'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { GlowText, TerminalCard, TerminalButton } from '@/components/crt';

type Template = 'topArtist' | 'top5Artists' | 'topTrack' | 'stats';
type TimeRange = 'short_term' | 'medium_term' | 'long_term';

const templates: Record<Template, string> = {
  topArtist: '#1 Artist',
  top5Artists: 'Top 5 Artists',
  topTrack: '#1 Track',
  stats: 'Stats Card',
};

const timeRangeLabels: Record<TimeRange, string> = {
  short_term: '4 Weeks',
  medium_term: '6 Months',
  long_term: 'All Time',
};

interface ShareData {
  topArtists: Array<{ name: string; image: string }>;
  topTracks: Array<{ name: string; artist: string; image: string }>;
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

  const [artistsRes, tracksRes, userRes, statsRes] = await Promise.all([
    fetch(`/api/spotify/top-artists?time_range=${timeRange}&limit=5`),
    fetch(`/api/spotify/top-tracks?time_range=${timeRange}&limit=5`),
    fetch('/api/spotify/me'),
    fetch(`/api/stats?${statsParams.toString()}`),
  ]);

  const [artists, tracks, user, stats] = await Promise.all([
    artistsRes.ok ? artistsRes.json() : { items: [] },
    tracksRes.ok ? tracksRes.json() : { items: [] },
    userRes.ok ? userRes.json() : { display_name: 'User' },
    statsRes.ok ? statsRes.json() : null,
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
            <span className="text-[#888888]">◫</span> Share
          </GlowText>
        </h1>
        <p className="mt-1 font-mono text-sm text-[#888888]">
          Create shareable cards for Instagram Stories (1080x1920)
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
          <TerminalCard title="select_template">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(templates) as Template[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`rounded-md border p-3 text-left font-terminal text-sm transition-all ${
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
          <TerminalCard title="time_range">
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
              {isDownloading ? 'GENERATING...' : 'Download PNG'}
            </TerminalButton>
          </div>

          <p className="font-mono text-xs text-[#555555]">
            Tip: Cards are optimized for Instagram Stories (9:16 aspect ratio)
          </p>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-3 font-terminal text-sm text-[#888888]">Preview</p>
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
                  <p className="font-terminal text-[#00ff41]">Loading...</p>
                </div>
              ) : data ? (
                <>
                  {template === 'topArtist' && <TopArtistCard data={data} timeRange={timeRange} />}
                  {template === 'top5Artists' && <Top5ArtistsCard data={data} timeRange={timeRange} />}
                  {template === 'topTrack' && <TopTrackCard data={data} timeRange={timeRange} />}
                  {template === 'stats' && <StatsCard data={data} timeRange={timeRange} />}
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

function TopArtistCard({ data, timeRange }: { data: ShareData; timeRange: TimeRange }) {
  const artist = data.topArtists[0];
  if (!artist) return null;

  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-4 font-terminal text-sm text-[#888888]">
          My #1 Artist ({timeRangeLabels[timeRange]})
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

function Top5ArtistsCard({ data, timeRange }: { data: ShareData; timeRange: TimeRange }) {
  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col">
        <p className="mb-6 text-center font-terminal text-sm text-[#888888]">
          Top 5 Artists ({timeRangeLabels[timeRange]})
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

function TopTrackCard({ data, timeRange }: { data: ShareData; timeRange: TimeRange }) {
  const track = data.topTracks[0];
  if (!track) return null;

  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-4 font-terminal text-sm text-[#888888]">
          My #1 Track ({timeRangeLabels[timeRange]})
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

function StatsCard({ data, timeRange }: { data: ShareData; timeRange: TimeRange }) {
  const hours = Math.floor(data.stats.totalMinutes / 60);
  const minutes = data.stats.totalMinutes % 60;
  const hasListeningData = data.stats.totalMinutes > 0 || data.stats.totalTracks > 0;

  return (
    <CardWrapper userName={data.userName}>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-6 font-terminal text-sm text-[#888888]">
          My Stats ({timeRangeLabels[timeRange]})
        </p>
        <div className="space-y-6">
          {hasListeningData && (
            <>
              <div>
                <p className="font-terminal text-4xl text-[#ffb000]">
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                </p>
                <p className="mt-1 font-mono text-xs text-[#888888]">Time Listened</p>
              </div>
              <div>
                <p className="font-terminal text-4xl text-[#00ff41]">{data.stats.totalTracks.toLocaleString()}</p>
                <p className="mt-1 font-mono text-xs text-[#888888]">Tracks Played</p>
              </div>
            </>
          )}
          <div className="flex gap-8 justify-center">
            <div>
              <p className="font-terminal text-3xl text-[#00f5ff]">{data.stats.uniqueArtists}</p>
              <p className="mt-1 font-mono text-xs text-[#888888]">Artists</p>
            </div>
            <div>
              <p className="font-terminal text-3xl text-[#ff00ff]">{data.stats.uniqueTracks}</p>
              <p className="mt-1 font-mono text-xs text-[#888888]">Tracks</p>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
