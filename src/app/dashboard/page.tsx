'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import { UpcomingConcerts } from '@/components/dashboard/UpcomingConcerts';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslations } from 'next-intl';

interface NowPlayingData {
  isPlaying: boolean;
  track?: {
    name: string;
    artists: string;
    album: string;
    albumArt?: string;
    progress: number;
    duration: number;
  };
}

interface RecentTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt?: string;
  playedAt: string;
}

interface TopArtist {
  id: string;
  name: string;
  image?: string;
  genres: string[];
}

interface TopTrack {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  spotifyUrl: string;
}

interface ListeningStats {
  listeningByHour: Array<{ hour: number; count: number }>;
  peakHour: number;
  totalTracks: number;
  totalMinutes: number;
}

// Fetch functions
async function fetchNowPlaying(): Promise<NowPlayingData> {
  const res = await fetch('/api/spotify/now-playing');
  if (!res.ok) return { isPlaying: false };

  const data = await res.json();

  if (!data.is_playing || !data.item) {
    return { isPlaying: false };
  }

  return {
    isPlaying: data.is_playing,
    track: {
      name: data.item.name,
      artists: data.item.artists?.map((a: { name: string }) => a.name).join(', ') || 'Unknown',
      album: data.item.album?.name || 'Unknown',
      albumArt: data.item.album?.images?.[0]?.url,
      progress: data.progress_ms || 0,
      duration: data.item.duration_ms || 0,
    },
  };
}

async function fetchRecentTracks(): Promise<RecentTrack[]> {
  const res = await fetch('/api/spotify/recent-tracks?limit=8');
  if (!res.ok) return [];
  const data = await res.json();
  return data.items?.map((item: { track: { id: string; name: string; artists: { name: string }[]; album: { name: string; images: { url: string }[] } }; played_at: string }) => ({
    id: item.track.id,
    name: item.track.name,
    artist: item.track.artists[0]?.name || 'Unknown',
    album: item.track.album.name,
    albumArt: item.track.album.images[0]?.url,
    playedAt: item.played_at,
  })) || [];
}

async function fetchTopArtists(): Promise<TopArtist[]> {
  const res = await fetch('/api/spotify/top-artists?time_range=short_term&limit=6');
  if (!res.ok) return [];
  const data = await res.json();
  return data.items?.map((artist: { id: string; name: string; images: { url: string }[]; genres: string[] }) => ({
    id: artist.id,
    name: artist.name,
    image: artist.images[0]?.url,
    genres: artist.genres.slice(0, 2),
  })) || [];
}

async function fetchTopTracks(): Promise<TopTrack[]> {
  const res = await fetch('/api/spotify/top-tracks?time_range=short_term&limit=5');
  if (!res.ok) return [];
  const data = await res.json();
  return data.items?.map((track: { id: string; name: string; artists: { name: string }[]; album: { images: { url: string }[] }; external_urls: { spotify: string } }) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    albumArt: track.album.images[0]?.url,
    spotifyUrl: track.external_urls.spotify,
  })) || [];
}

async function fetchListeningStats(): Promise<ListeningStats> {
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`/api/stats?start_date=${startDate}&end_date=${endDate}`);
  if (!res.ok) return { listeningByHour: [], peakHour: 0, totalTracks: 0, totalMinutes: 0 };
  const data = await res.json();

  const byHour = data.listening_by_hour || [];
  const peakHour = byHour.length > 0
    ? byHour.reduce((max: { hour: number; count: number }, h: { hour: number; count: number }) =>
        h.count > max.count ? h : max, byHour[0]).hour
    : 0;

  return {
    listeningByHour: byHour,
    peakHour,
    totalTracks: data.total_tracks || 0,
    totalMinutes: data.total_minutes || 0,
  };
}

// Scroll reveal section wrapper
function RevealSection({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Highlight text component
function Highlight({
  children,
  color = 'green'
}: {
  children: React.ReactNode;
  color?: 'green' | 'purple' | 'pink' | 'blue' | 'amber';
}) {
  const colors = {
    green: 'bg-[#1DB954]/20',
    purple: 'bg-[#8B5CF6]/20',
    pink: 'bg-[#EC4899]/20',
    blue: 'bg-[#3B82F6]/20',
    amber: 'bg-[#F59E0B]/20',
  };

  return (
    <span className={`relative inline-block px-2 -mx-1 ${colors[color]} rounded-lg`}>
      {children}
    </span>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('greeting.morning'));
    else if (hour < 18) setGreeting(t('greeting.afternoon'));
    else setGreeting(t('greeting.evening'));

    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.name) {
          setUserName(data.user.name.split(' ')[0]);
        }
      });
  }, [t]);

  const { data: nowPlaying } = useQuery({
    queryKey: ['now-playing'],
    queryFn: fetchNowPlaying,
    refetchInterval: 10000,
  });

  const { data: recentTracks } = useQuery({
    queryKey: ['recent-tracks'],
    queryFn: fetchRecentTracks,
  });

  const { data: topArtists } = useQuery({
    queryKey: ['top-artists'],
    queryFn: fetchTopArtists,
  });

  const { data: topTracks } = useQuery({
    queryKey: ['top-tracks-home'],
    queryFn: fetchTopTracks,
  });

  const { data: listeningStats } = useQuery({
    queryKey: ['listening-stats'],
    queryFn: fetchListeningStats,
  });

  const { location } = useGeolocation();
  const artistNames = topArtists?.map((a) => a.name) || [];
  const { data: tourStatus } = useTourStatusBatch(
    artistNames,
    location?.lat,
    location?.lng
  );

  return (
    <div className="relative">
      {/* Hero Section - Now Playing */}
      <section className="min-h-[70vh] flex items-center px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto w-full">
          {nowPlaying?.isPlaying && nowPlaying.track ? (
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Album Art - Large and prominent */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl">
                  {nowPlaying.track.albumArt && (
                    <Image
                      src={nowPlaying.track.albumArt}
                      alt={nowPlaying.track.album}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  )}
                  {/* Overlay with now playing indicator */}
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                    <span className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 bg-[#1DB954] rounded-full"
                          animate={{ height: ['8px', '20px', '8px'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </span>
                    <span className="text-sm font-medium text-foreground">{t('nowPlaying.liveShort')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Track Info - Editorial style */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Greeting */}
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {greeting}{userName && `, ${userName}`}
                </h2>
                <p className="text-sm uppercase tracking-[0.3em] text-[#1DB954] mb-6 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]" />
                  </span>
                  {t('nowPlaying.live')}
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] tracking-tight text-foreground mb-4">
                  {nowPlaying.track.name}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-1">
                  {nowPlaying.track.artists}
                </p>
                <p className="text-base text-muted-foreground/70 mb-8">
                  {nowPlaying.track.album}
                </p>

                {/* Progress bar - Minimal */}
                <div className="max-w-md">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#1DB954] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(nowPlaying.track.progress / nowPlaying.track.duration) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(nowPlaying.track.progress)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(nowPlaying.track.duration)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Not Playing State - Editorial greeting */
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
                {t('nowPlaying.notPlaying')}
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight text-foreground mb-8">
                {greeting}
                {userName && (
                  <>
                    ,<br />
                    <Highlight color="green">{userName}</Highlight>
                  </>
                )}
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                {t('nowPlaying.hint')}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Section - Large numbers */}
      <RevealSection className="py-24 md:py-32 px-6 md:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            {t('stats.dataFrom')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatItem
              value={listeningStats?.totalMinutes || 0}
              label={t('stats.minutesListened')}
              color="#1DB954"
              delay={0}
            />
            <StatItem
              value={listeningStats?.totalTracks || 0}
              label={t('stats.tracksPlayed')}
              color="#8B5CF6"
              delay={0.1}
            />
            <StatItem
              value={listeningStats?.peakHour !== undefined ? formatHourNumber(listeningStats.peakHour) : 0}
              label={t('stats.peakHour')}
              suffix={listeningStats?.peakHour !== undefined ? (listeningStats.peakHour >= 12 ? 'PM' : 'AM') : ''}
              color="#F59E0B"
              delay={0.2}
            />
            <StatItem
              value={Math.round((listeningStats?.totalMinutes || 0) / 28)}
              label={t('stats.avgPerDay')}
              suffix="min"
              color="#EC4899"
              delay={0.3}
            />
          </div>
        </div>
      </RevealSection>

      {/* Top Artists Section - Editorial grid */}
      <RevealSection className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {t('timeRanges.short')}
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-foreground">
                {t('sections.topArtists')}
              </h2>
            </div>
            <Link
              href="/dashboard/top?view=artists"
              className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#1DB954] transition-colors"
            >
              <span>{tCommon('viewAll')}</span>
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </div>

          {topArtists && topArtists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {topArtists.slice(0, 6).map((artist, index) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  rank={index + 1}
                  onTour={tourStatus?.[artist.name]?.onTour}
                  delay={index * 0.1}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">{t('empty.noData')}</p>
          )}
        </div>
      </RevealSection>

      {/* Top Tracks Section - List style */}
      <RevealSection className="py-24 md:py-32 px-6 md:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {t('timeRanges.short')}
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4">
                {t('sections.topTracks')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('sections.topTracksDescription')}
              </p>
              <Link
                href="/dashboard/top?view=tracks"
                className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#1DB954] transition-colors"
              >
                <span>{tCommon('viewAll')}</span>
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </div>

            <div className="space-y-1">
              {topTracks && topTracks.length > 0 ? (
                topTracks.slice(0, 5).map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    rank={index + 1}
                    delay={index * 0.1}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">{t('empty.noData')}</p>
              )}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Concerts Section */}
      {topArtists && topArtists.length > 0 && (
        <RevealSection className="py-24 md:py-32 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <UpcomingConcerts topArtists={topArtists} />
          </div>
        </RevealSection>
      )}

      {/* Recent Activity - Bento Grid */}
      <RevealSection className="py-24 md:py-32 px-6 md:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {t('sections.justPlayed')}
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground">
                {t('sections.recentActivity')}
              </h2>
            </div>
            <Link
              href="/dashboard/history"
              className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#1DB954] transition-colors"
            >
              <span>{tCommon('viewAll')}</span>
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </div>

          {recentTracks && recentTracks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[180px]">
              {/* Hero card - most recent track */}
              <RecentTrackBento
                track={recentTracks[0]}
                index={0}
                variant="hero"
                formatTimeAgo={createTimeAgoFormatter(tCommon)}
              />
              {/* Remaining tracks in smaller cards */}
              {recentTracks.slice(1, 7).map((track, index) => (
                <RecentTrackBento
                  key={`${track.id}-${track.playedAt}`}
                  track={track}
                  index={index + 1}
                  variant={index === 1 ? 'tall' : 'normal'}
                  formatTimeAgo={createTimeAgoFormatter(tCommon)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t('empty.noTracks')}</p>
          )}
        </div>
      </RevealSection>

      {/* Quick Links - Feature cards */}
      <RevealSection className="py-24 md:py-32 px-6 md:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              {t('sections.exploreMore')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('sections.exploreMoreDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureLink
              href="/dashboard/discover"
              title={t('featureCards.aiDiscover.title')}
              description={t('featureCards.aiDiscover.description')}
              color="#8B5CF6"
              icon="ai"
              exploreLabel={t('sections.explore')}
            />
            <FeatureLink
              href="/dashboard/wrapped"
              title={t('featureCards.wrapped.title')}
              description={t('featureCards.wrapped.description')}
              color="#F59E0B"
              icon="wrapped"
              exploreLabel={t('sections.explore')}
            />
            <FeatureLink
              href="/dashboard/share"
              title={t('featureCards.share.title')}
              description={t('featureCards.share.description')}
              color="#3B82F6"
              icon="share"
              exploreLabel={t('sections.explore')}
            />
          </div>
        </div>
      </RevealSection>
    </div>
  );
}

// Stat item with animated number
function StatItem({
  value,
  label,
  suffix = '',
  color,
  delay
}: {
  value: number;
  label: string;
  suffix?: string;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 1500;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
    >
      <p className="text-5xl md:text-7xl font-black mb-2" style={{ color }}>
        {displayValue.toLocaleString()}
        {suffix && <span className="text-2xl md:text-3xl ml-1">{suffix}</span>}
      </p>
      <p className="text-sm text-muted-foreground uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

// Artist card for grid
function ArtistCard({
  artist,
  rank,
  onTour,
  delay
}: {
  artist: TopArtist;
  rank: number;
  onTour?: boolean;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
        {artist.image ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-4xl opacity-30">♪</span>
          </div>
        )}
        {/* Rank badge */}
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
          <span className="text-lg font-bold text-foreground">{rank}</span>
        </div>
        {/* Tour badge */}
        {onTour && (
          <div className="absolute top-4 right-4">
            <OnTourBadge variant="compact" />
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground group-hover:text-[#1DB954] transition-colors">
        {artist.name}
      </h3>
      {artist.genres.length > 0 && (
        <p className="text-sm text-muted-foreground truncate">
          {artist.genres.join(' • ')}
        </p>
      )}
    </motion.div>
  );
}

// Track row for list
function TrackRow({
  track,
  rank,
  delay
}: {
  track: TopTrack;
  rank: number;
  delay: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.a
      ref={ref}
      href={track.spotifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.5, delay }}
      className="group flex items-center gap-4 py-4 px-4 -mx-4 rounded-xl border-b border-transparent hover:border-transparent hover:bg-white/70 dark:hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-sm transition-all"
    >
      <span className="text-3xl font-black text-muted-foreground/30 w-12 group-hover:text-[#1DB954] transition-colors">
        {rank.toString().padStart(2, '0')}
      </span>
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        {track.albumArt ? (
          <Image
            src={track.albumArt}
            alt={track.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-lg opacity-30">♪</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate group-hover:text-[#1DB954] transition-colors">
          {track.name}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {track.artist}
        </p>
      </div>
      <span className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        →
      </span>
    </motion.a>
  );
}

// Recent track bento card - playful grid layout
function RecentTrackBento({
  track,
  index,
  variant = 'normal',
  formatTimeAgo
}: {
  track: RecentTrack;
  index: number;
  variant?: 'hero' | 'tall' | 'normal';
  formatTimeAgo: (date: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const timeAgo = formatTimeAgo(track.playedAt);

  const gridClasses = {
    hero: 'col-span-2 row-span-2',
    tall: 'col-span-1 row-span-2',
    normal: 'col-span-1 row-span-1',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${gridClasses[variant]}`}
    >
      {/* Album art background */}
      <div className="absolute inset-0">
        {track.albumArt ? (
          <Image
            src={track.albumArt}
            alt={track.album}
            fill
            sizes={variant === 'hero' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-[#8B5CF6]/20" />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Animated border on hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/30 transition-colors duration-300" />

      {/* Time badge - floating pill */}
      <motion.div
        className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md"
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-[10px] font-semibold text-white tracking-wide">
          {timeAgo}
        </span>
      </motion.div>

      {/* Content */}
      <div className={`absolute inset-x-0 bottom-0 p-4 ${variant === 'hero' ? 'md:p-6' : ''}`}>
        {/* Playing indicator for hero */}
        {variant === 'hero' && index === 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 bg-[#1DB954] rounded-full"
                  animate={{ height: ['4px', '12px', '4px'] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </span>
            <span className="text-[10px] font-medium text-[#1DB954] uppercase tracking-wider">
              Latest
            </span>
          </div>
        )}

        <h4 className={`font-bold text-white truncate group-hover:text-[#1DB954] transition-colors ${
          variant === 'hero' ? 'text-xl md:text-2xl' : 'text-sm'
        }`}>
          {track.name}
        </h4>
        <p className={`text-white/70 truncate mt-0.5 ${
          variant === 'hero' ? 'text-base' : 'text-xs'
        }`}>
          {track.artist}
        </p>

        {/* Hover reveal - album name */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className={`text-white/50 truncate mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            variant === 'hero' ? 'text-sm' : 'text-[10px]'
          }`}
        >
          {track.album}
        </motion.p>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute top-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-[#1DB954]/50 rounded-tl-lg" />
      </div>
    </motion.div>
  );
}

// Feature link card with flashy icons
function FeatureLink({
  href,
  title,
  description,
  color,
  icon,
  exploreLabel
}: {
  href: string;
  title: string;
  description: string;
  color: string;
  icon: 'ai' | 'wrapped' | 'share';
  exploreLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group block p-8 rounded-2xl bg-white dark:bg-white/5 border border-border/30 hover:border-transparent hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
      style={{ '--accent-color': color } as React.CSSProperties}
    >
      <div
        className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <FeatureIcon type={icon} color={color} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[var(--accent-color)] transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-[var(--accent-color)] transition-colors">
        <span>{exploreLabel}</span>
        <motion.span
          className="inline-block"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </div>
    </Link>
  );
}

// Flashy animated icons for features
function FeatureIcon({ type, color }: { type: 'ai' | 'wrapped' | 'share'; color: string }) {
  if (type === 'ai') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <motion.circle
          cx="16"
          cy="16"
          r="8"
          stroke={color}
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M16 8v16M8 16h16"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="16"
          cy="16"
          r="3"
          fill={color}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Orbiting dots */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.circle
            key={angle}
            cx="16"
            cy="16"
            r="1.5"
            fill={color}
            animate={{
              cx: [
                16 + 10 * Math.cos((angle * Math.PI) / 180),
                16 + 10 * Math.cos(((angle + 90) * Math.PI) / 180),
                16 + 10 * Math.cos(((angle + 180) * Math.PI) / 180),
                16 + 10 * Math.cos(((angle + 270) * Math.PI) / 180),
                16 + 10 * Math.cos((angle * Math.PI) / 180),
              ],
              cy: [
                16 + 10 * Math.sin((angle * Math.PI) / 180),
                16 + 10 * Math.sin(((angle + 90) * Math.PI) / 180),
                16 + 10 * Math.sin(((angle + 180) * Math.PI) / 180),
                16 + 10 * Math.sin(((angle + 270) * Math.PI) / 180),
                16 + 10 * Math.sin((angle * Math.PI) / 180),
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i * 0.25 }}
          />
        ))}
      </svg>
    );
  }

  if (type === 'wrapped') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        {/* Stacked bars forming a chart */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.rect
            key={i}
            x={4 + i * 5}
            y={24}
            width="4"
            rx="2"
            fill={color}
            initial={{ height: 0 }}
            animate={{ height: [8, 12 + i * 3, 8 + i * 2, 16 - i, 8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            style={{ originY: 1 }}
          />
        ))}
        {/* Sparkle */}
        <motion.path
          d="M26 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
          fill={color}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    );
  }

  if (type === 'share') {
    return (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        {/* Phone outline */}
        <motion.rect
          x="8"
          y="4"
          width="16"
          height="24"
          rx="3"
          stroke={color}
          strokeWidth="2"
          fill="none"
          animate={{ y: [4, 3, 4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Screen content - Instagram story simulation */}
        <motion.rect
          x="10"
          y="8"
          width="12"
          height="16"
          rx="1"
          fill={color}
          fillOpacity={0.2}
        />
        {/* Pulsing share indicator */}
        <motion.circle
          cx="16"
          cy="16"
          r="3"
          fill={color}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {/* Share arrows */}
        <motion.path
          d="M16 13v-5M13 11l3-3 3 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </svg>
    );
  }

  return null;
}

// Utility functions
function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatHourNumber(hour: number): number {
  if (hour === 0) return 12;
  if (hour > 12) return hour - 12;
  return hour;
}

function createTimeAgoFormatter(t: ReturnType<typeof useTranslations<'common'>>) {
  return (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('timeAgo.justNow');
    if (diffMins < 60) return t('timeAgo.minutes', { count: diffMins });
    if (diffHours < 24) return t('timeAgo.hours', { count: diffHours });
    return t('timeAgo.days', { count: diffDays });
  };
}
