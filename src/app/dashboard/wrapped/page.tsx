'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GlowText, TerminalCard, TerminalButton } from '@/components/crt';
import { useTranslations } from 'next-intl';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface WrappedData {
  topArtists: Array<{
    name: string;
    image: string;
    playCount?: number;
  }>;
  topTracks: Array<{
    name: string;
    artist: string;
    image: string;
  }>;
  topGenres: string[];
  stats: {
    uniqueArtists: number;
    uniqueTracks: number;
    totalTracks: number;
    totalMinutes: number;
  };
  listeningByHour: Array<{ hour: number; count: number }>;
  listeningByDay: Array<{ day: string; count: number }>;
}

// Calculate date range based on time range
function getDateRange(timeRange: TimeRange): { start_date?: string; end_date?: string } {
  const now = new Date();
  switch (timeRange) {
    case 'short_term':
      const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      return { start_date: fourWeeksAgo.toISOString() };
    case 'medium_term':
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      return { start_date: sixMonthsAgo.toISOString() };
    case 'long_term':
    default:
      return {};
  }
}

async function fetchWrappedData(timeRange: TimeRange): Promise<WrappedData> {
  // Build date params for stats
  const dateRange = getDateRange(timeRange);
  const statsParams = new URLSearchParams();
  if (dateRange.start_date) statsParams.set('start_date', dateRange.start_date);
  if (dateRange.end_date) statsParams.set('end_date', dateRange.end_date);

  const [artistsRes, tracksRes, statsRes] = await Promise.all([
    fetch(`/api/spotify/top-artists?time_range=${timeRange}&limit=10`),
    fetch(`/api/spotify/top-tracks?time_range=${timeRange}&limit=10`),
    fetch(`/api/stats?${statsParams.toString()}`),
  ]);

  if (!artistsRes.ok || !tracksRes.ok) {
    throw new Error('Failed to fetch data');
  }

  const [artists, tracks, stats] = await Promise.all([
    artistsRes.json(),
    tracksRes.json(),
    statsRes.ok ? statsRes.json() : null,
  ]);

  const allGenres = artists.items?.flatMap((a: { genres: string[] }) => a.genres) || [];
  const genreCount = allGenres.reduce((acc: Record<string, number>, genre: string) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([genre]) => genre);

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
    topGenres,
    stats: {
      uniqueArtists: stats?.unique_artists || artists.items?.length || 0,
      uniqueTracks: stats?.unique_tracks || tracks.items?.length || 0,
      totalTracks: stats?.total_tracks || 0,
      totalMinutes: stats?.total_minutes || 0,
    },
    listeningByHour: stats?.listening_by_hour || [],
    listeningByDay: stats?.listening_by_day || [],
  };
}

const slides = ['intro', 'topArtist', 'topArtists', 'topTracks', 'genres', 'listeningPatterns', 'stats'];

export default function WrappedPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const t = useTranslations('wrapped');
  const tCommon = useTranslations('common');

  // Time range labels from translations
  const timeRangeLabels: Record<TimeRange, string> = {
    short_term: t('timeRanges.short'),
    medium_term: t('timeRanges.medium'),
    long_term: t('timeRanges.long'),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['wrapped', timeRange],
    queryFn: () => fetchWrappedData(timeRange),
  });

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const startPresentation = () => {
    setCurrentSlide(0);
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-terminal text-2xl text-[#ffb000]"
        >
          {t('loading')}
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <TerminalCard>
          <div className="py-8 text-center">
            <p className="font-terminal text-[#ff4444]">{t('failed')}</p>
          </div>
        </TerminalCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-terminal text-3xl">
            <GlowText color="amber" size="sm">
              <span className="text-[#888888]">◆</span> {t('title')}
            </GlowText>
          </h1>
          <p className="mt-1 font-mono text-sm text-[#888888]">
            {t('subtitle')}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
            <TerminalButton
              key={range}
              variant={timeRange === range ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                setTimeRange(range);
                setCurrentSlide(0);
                setIsPlaying(false);
              }}
            >
              {timeRangeLabels[range]}
            </TerminalButton>
          ))}
        </div>
      </motion.div>

      {/* Presentation Area */}
      {!isPlaying ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="mb-8 text-center">
            <h2 className="mb-2 font-terminal text-4xl text-[#ffb000]">
              {timeRangeLabels[timeRange]}
            </h2>
            <p className="font-mono text-[#888888]">{t('journeyAwaits')}</p>
          </div>
          <TerminalButton size="lg" glow onClick={startPresentation}>
            {t('startWrapped')}
          </TerminalButton>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Slide Container */}
          <div className="mx-auto max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {slides[currentSlide] === 'intro' && (
                  <SlideIntro timeRange={timeRangeLabels[timeRange]} />
                )}
                {slides[currentSlide] === 'topArtist' && data.topArtists[0] && (
                  <SlideTopArtist artist={data.topArtists[0]} />
                )}
                {slides[currentSlide] === 'topArtists' && (
                  <SlideTopArtists artists={data.topArtists.slice(0, 5)} />
                )}
                {slides[currentSlide] === 'topTracks' && (
                  <SlideTopTracks tracks={data.topTracks.slice(0, 5)} />
                )}
                {slides[currentSlide] === 'genres' && (
                  <SlideGenres genres={data.topGenres} />
                )}
                {slides[currentSlide] === 'listeningPatterns' && (
                  <SlideListeningPatterns
                    byHour={data.listeningByHour}
                    byDay={data.listeningByDay}
                  />
                )}
                {slides[currentSlide] === 'stats' && (
                  <SlideStats stats={data.stats} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <TerminalButton
              variant="ghost"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              {tCommon('previous')}
            </TerminalButton>
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-[#ffb000] shadow-[0_0_10px_rgba(255,176,0,0.5)]'
                      : 'bg-[#333333]'
                  }`}
                />
              ))}
            </div>
            <TerminalButton
              variant="ghost"
              onClick={nextSlide}
            >
              {currentSlide === slides.length - 1 ? tCommon('finish') : tCommon('next')}
            </TerminalButton>
          </div>
        </div>
      )}
    </div>
  );
}

function SlideIntro({ timeRange }: { timeRange: string }) {
  return (
    <TerminalCard className="py-16 text-center">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-4 font-terminal text-5xl text-[#ffb000]">
          Your {timeRange}
        </h2>
        <p className="font-mono text-lg text-[#888888]">
          Let&apos;s see what you&apos;ve been listening to
        </p>
      </motion.div>
    </TerminalCard>
  );
}

function SlideTopArtist({ artist }: { artist: { name: string; image: string } }) {
  return (
    <TerminalCard className="py-8 text-center">
      <p className="mb-4 font-terminal text-lg text-[#888888]">
        Your #1 Artist
      </p>
      {artist.image && (
        <div className="mx-auto mb-6 h-48 w-48 overflow-hidden rounded-full border-4 border-[#ffb000] shadow-[0_0_30px_rgba(255,176,0,0.3)]">
          <Image
            src={artist.image}
            alt={artist.name}
            width={192}
            height={192}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <h2 className="font-terminal text-4xl text-[#ffb000]">{artist.name}</h2>
    </TerminalCard>
  );
}

function SlideTopArtists({ artists }: { artists: Array<{ name: string; image: string }> }) {
  return (
    <TerminalCard className="py-8">
      <h2 className="mb-6 text-center font-terminal text-2xl text-[#ffb000]">
        Your Top Artists
      </h2>
      <div className="space-y-3">
        {artists.map((artist, index) => (
          <motion.div
            key={artist.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <span className="w-8 text-right font-terminal text-2xl text-[#ffb000]">
              {index + 1}
            </span>
            {artist.image && (
              <div className="h-12 w-12 overflow-hidden rounded-full border border-[rgba(255,176,0,0.3)]">
                <Image src={artist.image} alt={artist.name} width={48} height={48} className="h-full w-full object-cover" />
              </div>
            )}
            <span className="font-terminal text-lg text-[#e0e0e0]">{artist.name}</span>
          </motion.div>
        ))}
      </div>
    </TerminalCard>
  );
}

function SlideTopTracks({ tracks }: { tracks: Array<{ name: string; artist: string; image: string }> }) {
  return (
    <TerminalCard className="py-8">
      <h2 className="mb-6 text-center font-terminal text-2xl text-[#00f5ff]">
        Your Top Tracks
      </h2>
      <div className="space-y-3">
        {tracks.map((track, index) => (
          <motion.div
            key={track.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <span className="w-8 text-right font-terminal text-2xl text-[#00f5ff]">
              {index + 1}
            </span>
            {track.image && (
              <div className="h-12 w-12 overflow-hidden rounded border border-[rgba(0,245,255,0.3)]">
                <Image src={track.image} alt={track.name} width={48} height={48} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-terminal text-[#e0e0e0]">{track.name}</p>
              <p className="truncate font-mono text-xs text-[#888888]">{track.artist}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </TerminalCard>
  );
}

function SlideGenres({ genres }: { genres: string[] }) {
  return (
    <TerminalCard className="py-8 text-center">
      <h2 className="mb-6 font-terminal text-2xl text-[#ff00ff]">
        Your Top Genres
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {genres.map((genre, index) => (
          <motion.span
            key={genre}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-full border border-[rgba(255,0,255,0.3)] bg-[rgba(255,0,255,0.1)] px-4 py-2 font-terminal text-[#ff00ff]"
          >
            {genre}
          </motion.span>
        ))}
      </div>
    </TerminalCard>
  );
}

function SlideListeningPatterns({
  byHour,
  byDay,
}: {
  byHour: Array<{ hour: number; count: number }>;
  byDay: Array<{ day: string; count: number }>;
}) {
  const maxHourCount = Math.max(...byHour.map((h) => h.count), 1);
  const maxDayCount = Math.max(...byDay.map((d) => d.count), 1);

  // Find peak listening hour
  const peakHour = byHour.reduce((max, h) => (h.count > max.count ? h : max), byHour[0] || { hour: 0, count: 0 });
  const formatHour = (h: number) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  return (
    <TerminalCard className="py-8">
      <h2 className="mb-6 text-center font-terminal text-2xl text-[#ff00ff]">
        Your Listening Patterns
      </h2>

      {byHour.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-center font-mono text-sm text-[#888888]">
            Peak listening time: <span className="text-[#ff00ff]">{formatHour(peakHour.hour)}</span>
          </p>
          <div className="flex items-end justify-center gap-1 h-24">
            {byHour.map((item, index) => (
              <motion.div
                key={item.hour}
                initial={{ height: 0 }}
                animate={{ height: `${(item.count / maxHourCount) * 100}%` }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                className="w-2 min-h-[2px] rounded-t bg-gradient-to-t from-[#ff00ff] to-[#00f5ff]"
                title={`${formatHour(item.hour)}: ${item.count} plays`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-xs text-[#555555]">
            <span>12AM</span>
            <span>12PM</span>
            <span>11PM</span>
          </div>
        </div>
      )}

      {byDay.length > 0 && (
        <div>
          <p className="mb-3 text-center font-mono text-sm text-[#888888]">By Day of Week</p>
          <div className="flex justify-center gap-3">
            {byDay.map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="text-center"
              >
                <div
                  className="mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center font-terminal text-xs"
                  style={{
                    backgroundColor: `rgba(255, 0, 255, ${0.1 + (item.count / maxDayCount) * 0.4})`,
                    color: item.count > maxDayCount * 0.5 ? '#ff00ff' : '#888888',
                  }}
                >
                  {item.count}
                </div>
                <span className="font-mono text-xs text-[#555555]">{item.day}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {byHour.length === 0 && byDay.length === 0 && (
        <p className="text-center font-mono text-sm text-[#555555]">
          Sync more history to see patterns
        </p>
      )}
    </TerminalCard>
  );
}

function SlideStats({ stats }: { stats: { uniqueArtists: number; uniqueTracks: number; totalTracks: number; totalMinutes: number } }) {
  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;

  return (
    <TerminalCard className="py-8 text-center">
      <h2 className="mb-8 font-terminal text-2xl text-[#00ff41]">
        Your Stats
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {stats.totalMinutes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-2"
          >
            <p className="font-terminal text-5xl text-[#ffb000]">
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
            </p>
            <p className="mt-2 font-mono text-sm text-[#888888]">Time Listened</p>
          </motion.div>
        )}
        {stats.totalTracks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-terminal text-4xl text-[#00ff41]">{stats.totalTracks.toLocaleString()}</p>
            <p className="mt-2 font-mono text-sm text-[#888888]">Tracks Played</p>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-terminal text-4xl text-[#00f5ff]">{stats.uniqueArtists}</p>
          <p className="mt-2 font-mono text-sm text-[#888888]">Unique Artists</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="font-terminal text-4xl text-[#ff00ff]">{stats.uniqueTracks}</p>
          <p className="mt-2 font-mono text-sm text-[#888888]">Unique Tracks</p>
        </motion.div>
      </div>
    </TerminalCard>
  );
}
