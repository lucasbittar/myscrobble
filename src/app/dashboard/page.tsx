'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { GlowText, TerminalCard } from '@/components/crt';

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

interface TopAlbum {
  id: string;
  name: string;
  artist: string;
  image?: string;
  spotifyUrl: string;
  trackCount: number;
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

  // Transform Spotify API response to our interface
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
  const res = await fetch('/api/spotify/recent-tracks?limit=6');
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
  const res = await fetch('/api/spotify/top-artists?time_range=short_term&limit=5');
  if (!res.ok) return [];
  const data = await res.json();
  return data.items?.map((artist: { id: string; name: string; images: { url: string }[]; genres: string[] }) => ({
    id: artist.id,
    name: artist.name,
    image: artist.images[0]?.url,
    genres: artist.genres.slice(0, 2),
  })) || [];
}

async function fetchTopAlbums(): Promise<TopAlbum[]> {
  const res = await fetch('/api/spotify/top-albums?time_range=short_term&limit=6');
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
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
  // Get stats for the last 4 weeks (28 days) to match Spotify's short_term
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

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  // Fetch session for user name
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user?.name) {
          setUserName(data.user.name.split(' ')[0]);
        }
      });
  }, []);

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

  const { data: topAlbums } = useQuery({
    queryKey: ['top-albums-home'],
    queryFn: fetchTopAlbums,
  });

  const { data: topTracks } = useQuery({
    queryKey: ['top-tracks-home'],
    queryFn: fetchTopTracks,
  });

  const { data: listeningStats } = useQuery({
    queryKey: ['listening-stats'],
    queryFn: fetchListeningStats,
  });

  return (
    <div className="space-y-8">
      {/* Hero Section - Now Playing */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-background to-background"
      >
        {/* Background glow effect */}
        {nowPlaying?.track?.albumArt && (
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{
              backgroundImage: `url(${nowPlaying.track.albumArt})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          {nowPlaying?.isPlaying && nowPlaying.track ? (
            <>
              {/* Terminal Header - Greeting + Status (only when playing) */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-terminal">&gt;</span>
                  <h2 className="font-terminal text-lg sm:text-xl text-foreground">
                    {greeting}{userName && `, ${userName}`}
                    <motion.span
                      className="inline-block w-2 h-5 bg-primary ml-1 align-middle"
                      animate={{ opacity: [1, 1, 0, 0] }}
                      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                    />
                  </h2>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="font-terminal text-xs text-primary uppercase tracking-wider">Now Live</span>
                </motion.div>
              </div>

              {/* Now Playing Content */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                {/* Album Art */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                  >
                    <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-xl overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_var(--primary)/15]">
                      {nowPlaying.track.albumArt && (
                        <Image
                          src={nowPlaying.track.albumArt}
                          alt={nowPlaying.track.album}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    {/* Playing indicator */}
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-primary">
                      <span className="flex gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1 bg-primary rounded-full"
                            animate={{ height: ['8px', '16px', '8px'] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </span>
                      <span className="font-terminal text-xs text-primary uppercase">Live</span>
                    </div>
                  </motion.div>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="font-terminal text-2xl sm:text-3xl lg:text-4xl text-foreground truncate mb-2">
                    {nowPlaying.track.name}
                  </h1>
                  <p className="font-mono text-xl text-primary truncate mb-1">
                    {nowPlaying.track.artists}
                  </p>
                  <p className="font-mono text-base text-muted-foreground truncate mb-6">
                    {nowPlaying.track.album}
                  </p>

                  {/* Progress bar */}
                  <div className="max-w-md">
                    <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(nowPlaying.track.progress / nowPlaying.track.duration) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatTime(nowPlaying.track.progress)}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatTime(nowPlaying.track.duration)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Not Playing State - Original Layout */
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
              <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center bg-primary/5 flex-shrink-0">
                <div className="text-center">
                  <span className="text-4xl opacity-30">♪</span>
                  <p className="mt-2 font-terminal text-xs text-muted-foreground">Not playing</p>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  Nothing Playing
                </p>
                <h2 className="font-terminal text-3xl sm:text-4xl text-foreground mb-2">
                  <span className="text-primary">&gt;</span> {greeting}{userName && `, ${userName}`}
                  <motion.span
                    className="inline-block w-3 h-8 bg-primary ml-2 align-middle"
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                  />
                </h2>
                <p className="font-mono text-base text-muted-foreground">
                  Play something on Spotify to see it here
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Feature Cards - Prominent CTAs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            href="/dashboard/discover"
            title="AI Discover"
            description="Get personalized artist recommendations powered by AI"
            icon="✦"
            gradient="from-[#00f5ff] to-[#0066ff]"
            accentColor="#00f5ff"
          />
          <FeatureCard
            href="/dashboard/wrapped"
            title="Your Wrapped"
            description="Explore your listening story with custom time ranges"
            icon="◆"
            gradient="from-[#ffb000] to-[#ff6600]"
            accentColor="#ffb000"
          />
          <FeatureCard
            href="/dashboard/share"
            title="Share"
            description="Create beautiful cards for Instagram Stories"
            icon="◫"
            gradient="from-[#ff00ff] to-[#aa00ff]"
            accentColor="#ff00ff"
          />
        </div>
      </motion.section>

      {/* Recent Activity - Horizontal Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-terminal text-xl">
            <GlowText color="phosphor" size="sm">
              <span className="text-muted-foreground">◎</span> Recent Activity
            </GlowText>
          </h2>
          <Link
            href="/dashboard/history"
            className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentTracks && recentTracks.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentTracks.map((track, index) => (
                <motion.div
                  key={`${track.id}-${track.playedAt}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="relative flex-shrink-0 group"
                >
                  {/* Time dot on timeline */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />

                  <div className={`relative rounded-xl overflow-hidden border border-border bg-card transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.15)] ${index === 0 ? 'w-40' : 'w-32'}`}>
                    <div className={`relative ${index === 0 ? 'h-40' : 'h-32'}`}>
                      {track.albumArt ? (
                        <Image
                          src={track.albumArt}
                          alt={track.album}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-2xl">
                          ♪
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                      {/* Track info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className={`font-terminal text-foreground truncate ${index === 0 ? 'text-sm' : 'text-xs'}`}>
                          {track.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {track.artist}
                        </p>
                      </div>

                      {/* Time badge */}
                      <div className="absolute top-2 right-2 px-2 pb-1 rounded-full bg-background/80 backdrop-blur-sm leading-none">
                        <span className="font-mono text-[10px] text-primary">
                          {formatRelativeTime(track.playedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <TerminalCard animate={false}>
            <div className="py-8 text-center">
              <p className="font-mono text-base text-muted-foreground">No recent tracks</p>
            </div>
          </TerminalCard>
        )}
      </motion.section>

      {/* Stats Row - Peak Listening + Quick Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Peak Listening Time - Clock Visualization */}
          <div className="md:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[var(--crt-amber)]">⏱</span>
              <h3 className="font-terminal text-base text-foreground">Peak Listening Time</h3>
            </div>

            {listeningStats && listeningStats.listeningByHour.length > 0 ? (
              <div className="flex items-center gap-6">
                {/* Clock visualization */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-border"
                    />
                    {/* Hour markers */}
                    {[...Array(24)].map((_, i) => {
                      const hourData = listeningStats.listeningByHour.find(h => h.hour === i);
                      const maxCount = Math.max(...listeningStats.listeningByHour.map(h => h.count), 1);
                      const intensity = hourData ? hourData.count / maxCount : 0;
                      const angle = (i / 24) * 360;
                      const x1 = 50 + 35 * Math.cos((angle * Math.PI) / 180);
                      const y1 = 50 + 35 * Math.sin((angle * Math.PI) / 180);
                      const x2 = 50 + (35 + 10 * intensity) * Math.cos((angle * Math.PI) / 180);
                      const y2 = 50 + (35 + 10 * intensity) * Math.sin((angle * Math.PI) / 180);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={`var(--crt-amber)`}
                          strokeWidth={intensity > 0.5 ? 3 : 2}
                          strokeLinecap="round"
                          opacity={0.2 + intensity * 0.8}
                        />
                      );
                    })}
                    {/* Peak hour indicator */}
                    <circle
                      cx={50 + 35 * Math.cos(((listeningStats.peakHour / 24) * 360 - 90) * Math.PI / 180)}
                      cy={50 + 35 * Math.sin(((listeningStats.peakHour / 24) * 360 - 90) * Math.PI / 180)}
                      r="5"
                      fill="var(--crt-amber)"
                      className="animate-pulse"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-terminal text-lg text-[var(--crt-amber)]">
                      {formatHour(listeningStats.peakHour)}
                    </span>
                  </div>
                </div>

                {/* Hourly bar chart */}
                <div className="flex-1">
                  <div className="flex items-end gap-0.5 h-16">
                    {[...Array(24)].map((_, i) => {
                      const hourData = listeningStats.listeningByHour.find(h => h.hour === i);
                      const maxCount = Math.max(...listeningStats.listeningByHour.map(h => h.count), 1);
                      const height = hourData ? (hourData.count / maxCount) * 100 : 5;
                      const isPeak = i === listeningStats.peakHour;
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.02, duration: 0.3 }}
                          className={`flex-1 min-h-[2px] rounded-t ${isPeak ? 'bg-[var(--crt-amber)]' : 'bg-[var(--crt-amber)]/30'}`}
                          title={`${formatHour(i)}: ${hourData?.count || 0} plays`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-mono text-[10px] text-muted-foreground">12AM</span>
                    <span className="font-mono text-[10px] text-muted-foreground">12PM</span>
                    <span className="font-mono text-[10px] text-muted-foreground">11PM</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24">
                <p className="font-mono text-sm text-muted-foreground">Sync history to see patterns</p>
              </div>
            )}
          </div>

          {/* Peak Hour stat */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-center items-center">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Peak Hour</span>
            <span className="font-terminal text-4xl text-[var(--crt-amber)]">
              {listeningStats?.peakHour !== undefined ? formatHour(listeningStats.peakHour) : '—'}
            </span>
            <span className="mt-2 font-mono text-xs text-muted-foreground">
              Most active time
            </span>
          </div>
        </div>
      </motion.section>

      {/* Period Header + Minutes Listened */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            {/* Arcade Trophy Podium Icon */}
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center overflow-hidden group">
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none" />

              {/* Glow pulse background */}
              <div className="absolute inset-0 bg-primary/20 animate-pulse" style={{ animationDuration: '2s' }} />

              {/* Podium bars container */}
              <div className="relative flex items-end justify-center gap-[3px] h-6">
                {/* 2nd place bar (left) */}
                <motion.div
                  className="w-[6px] bg-gradient-to-t from-primary to-primary/70 rounded-t-[2px]"
                  initial={{ height: 0 }}
                  animate={{ height: 14 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                  style={{ boxShadow: '0 0 6px var(--primary)' }}
                />
                {/* 1st place bar (center - tallest) with crown */}
                <div className="relative flex flex-col items-center">
                  {/* Crown */}
                  <motion.div
                    className="absolute -top-[7px] text-[8px] text-primary"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.3, type: "spring" }}
                    style={{ filter: 'drop-shadow(0 0 4px var(--primary))' }}
                  >
                    ♛
                  </motion.div>
                  <motion.div
                    className="w-[6px] bg-gradient-to-t from-primary via-primary to-primary/80 rounded-t-[2px]"
                    initial={{ height: 0 }}
                    animate={{ height: 20 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                    style={{ boxShadow: '0 0 10px var(--primary), 0 0 20px var(--primary)' }}
                  />
                </div>
                {/* 3rd place bar (right) */}
                <motion.div
                  className="w-[6px] bg-gradient-to-t from-primary/80 to-primary/50 rounded-t-[2px]"
                  initial={{ height: 0 }}
                  animate={{ height: 10 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                  style={{ boxShadow: '0 0 4px var(--primary)' }}
                />
              </div>

            </div>
            <div>
              <h3 className="font-terminal text-base text-foreground">Your Top Charts</h3>
              <p className="font-mono text-xs text-muted-foreground">Data from the last 4 weeks</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-right">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Minutes Listened</p>
              <p className="font-terminal text-2xl text-primary">
                {listeningStats?.totalMinutes?.toLocaleString() || '—'}
              </p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-primary/20" />
            <div className="text-center sm:text-right">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Tracks Played</p>
              <p className="font-terminal text-2xl text-primary">
                {listeningStats?.totalTracks?.toLocaleString() || '—'}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Two Column Grid - Artists & Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Artists - Podium Style */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-terminal text-xl">
                <GlowText color="cyan" size="sm">
                  <span className="text-muted-foreground">▲</span> Top Artists
                </GlowText>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-accent/10 font-mono text-[10px] text-accent uppercase">
                4 weeks
              </span>
            </div>
            <Link
              href="/dashboard/top?view=artists&time=short_term"
              className="font-mono text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 flex-1 flex flex-col justify-center">
            {topArtists && topArtists.length >= 3 ? (
              <>
                {/* Podium - Top 3 */}
                <div className="flex items-end justify-center gap-3 mb-6">
                  {/* 2nd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent/30 mb-2">
                      {topArtists[1]?.image && (
                        <Image src={topArtists[1].image} alt={topArtists[1].name} fill className="object-cover" />
                      )}
                    </div>
                    <p className="font-terminal text-xs text-foreground text-center truncate w-20">{topArtists[1]?.name}</p>
                    <div className="mt-2 w-16 h-12 bg-accent/20 rounded-t flex items-center justify-center">
                      <span className="font-terminal text-xl text-accent">2</span>
                    </div>
                  </motion.div>

                  {/* 1st Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-accent mb-2 shadow-[0_0_20px_rgba(var(--accent),0.3)]">
                      {topArtists[0]?.image && (
                        <Image src={topArtists[0].image} alt={topArtists[0].name} fill className="object-cover" />
                      )}
                    </div>
                    <p className="font-terminal text-sm text-foreground text-center truncate w-24">{topArtists[0]?.name}</p>
                    <div className="mt-2 w-20 h-16 bg-accent/30 rounded-t flex items-center justify-center">
                      <span className="font-terminal text-2xl text-accent">1</span>
                    </div>
                  </motion.div>

                  {/* 3rd Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-accent/20 mb-2">
                      {topArtists[2]?.image && (
                        <Image src={topArtists[2].image} alt={topArtists[2].name} fill className="object-cover" />
                      )}
                    </div>
                    <p className="font-terminal text-xs text-foreground text-center truncate w-16">{topArtists[2]?.name}</p>
                    <div className="mt-2 w-14 h-8 bg-accent/10 rounded-t flex items-center justify-center">
                      <span className="font-terminal text-lg text-accent/70">3</span>
                    </div>
                  </motion.div>
                </div>

                {/* Remaining artists */}
                {topArtists.length > 3 && (
                  <div className="flex justify-center gap-4 pt-4 border-t border-border">
                    {topArtists.slice(3, 5).map((artist, index) => (
                      <motion.div
                        key={artist.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <span className="font-terminal text-sm text-muted-foreground">{index + 4}</span>
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                          {artist.image && (
                            <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                          )}
                        </div>
                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[80px]">{artist.name}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="font-mono text-base text-muted-foreground">No data yet</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Top Tracks - Prestige Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-terminal text-xl">
                <GlowText color="phosphor" size="sm">
                  <span className="text-muted-foreground">♫</span> Top Tracks
                </GlowText>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 font-mono text-[10px] text-primary uppercase">
                4 weeks
              </span>
            </div>
            <Link
              href="/dashboard/top?view=tracks&time=short_term"
              className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="rounded-xl border border-primary/20 bg-card overflow-hidden flex-1">
            {topTracks && topTracks.length > 0 ? (
              <div>
                {topTracks.slice(0, 5).map((track, index) => {
                  const isTop3 = index < 3;
                  // Glow intensity decreases with rank
                  const glowIntensity = index === 0 ? 1 : index === 1 ? 0.6 : index === 2 ? 0.3 : 0;

                  return (
                    <motion.a
                      key={track.id}
                      href={track.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative flex items-center gap-3 p-3 pl-5 hover:bg-primary/5 transition-all duration-300 border-b border-primary/10 last:border-b-0"
                    >
                      {/* Left accent border for top 3 */}
                      {isTop3 && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                          style={{ opacity: 0.3 + glowIntensity * 0.7 }}
                        />
                      )}

                      {/* Rank badge - Terminal style */}
                      <div className="relative z-10 flex-shrink-0">
                        <motion.div
                          className={`min-w-[42px] h-8 rounded flex items-center justify-center font-terminal text-sm font-bold transition-all duration-300 ${
                            index === 0
                              ? 'bg-primary text-background shadow-[0_0_20px_var(--primary)]'
                              : index === 1
                              ? 'bg-primary/60 text-background shadow-[0_0_12px_var(--primary)]'
                              : index === 2
                              ? 'bg-primary/40 text-background shadow-[0_0_6px_var(--primary)]'
                              : 'bg-primary/10 text-primary/70'
                          }`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.1, type: "spring", stiffness: 200 }}
                        >
                          <span className="opacity-50">[</span>
                          {String(index + 1).padStart(2, '0')}
                          <span className="opacity-50">]</span>
                        </motion.div>
                      </div>

                      {/* Album art */}
                      <div className={`relative z-10 flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 ${isTop3 ? 'w-12 h-12 border-2' : 'w-10 h-10 border'} ${index === 0 ? 'border-primary/60' : index === 1 ? 'border-primary/40' : index === 2 ? 'border-primary/30' : 'border-primary/20'} group-hover:border-primary/80`}>
                        {track.albumArt ? (
                          <Image
                            src={track.albumArt}
                            alt={track.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/50">
                            ♪
                          </div>
                        )}
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Track info */}
                      <div className="relative z-10 flex-1 min-w-0">
                        <p className={`font-terminal truncate transition-colors ${isTop3 ? 'text-sm text-foreground' : 'text-sm text-foreground/80'} group-hover:text-primary`}>
                          {track.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {track.artist}
                        </p>
                      </div>

                      {/* Frequency bars - decorative */}
                      <div className="relative z-10 flex-shrink-0 flex items-center gap-3">
                        <div className="flex items-end gap-0.5 h-5">
                          {[0.3, 0.6, 1, 0.5, 0.8].map((height, i) => (
                            <motion.div
                              key={i}
                              className={`w-1 rounded-sm ${isTop3 ? 'bg-primary/60' : 'bg-primary/30'}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${height * 100}%` }}
                              transition={{
                                delay: index * 0.1 + 0.4 + i * 0.05,
                                duration: 0.4,
                                repeat: Infinity,
                                repeatType: "reverse",
                                repeatDelay: 2 + i * 0.5
                              }}
                            />
                          ))}
                        </div>

                        {/* Play indicator on hover */}
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                        >
                          <span className="text-primary text-lg">▶</span>
                        </motion.div>
                      </div>

                      {/* Scanline hover effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5"
                          initial={{ y: '-100%' }}
                          whileHover={{ y: '100%' }}
                          transition={{ duration: 0.6, ease: "linear" }}
                        />
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="font-mono text-sm text-muted-foreground">No data yet</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Top Albums - Vinyl Grid (Full Width) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-terminal text-xl">
              <GlowText color="magenta" size="sm">
                <span className="text-muted-foreground">◉</span> Top Albums
              </GlowText>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[var(--crt-magenta)]/10 font-mono text-[10px] text-[var(--crt-magenta)] uppercase">
              4 weeks
            </span>
          </div>
          <Link
            href="/dashboard/top?view=albums&time=short_term"
            className="font-mono text-sm text-muted-foreground hover:text-[var(--crt-magenta)] transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          {topAlbums && topAlbums.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {topAlbums.slice(0, 6).map((album, index) => (
                <motion.a
                  key={album.id}
                  href={album.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-[var(--crt-magenta)]/50 transition-all duration-300"
                >
                  {/* Album art */}
                  {album.image ? (
                    <Image
                      src={album.image}
                      alt={album.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                      ♪
                    </div>
                  )}

                  {/* Vinyl peek effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#1a1a1a] border-4 border-[#333] opacity-80">
                      <div className="absolute inset-2 rounded-full border border-[#444]" />
                      <div className="absolute inset-[35%] rounded-full bg-[var(--crt-magenta)]/50" />
                    </div>
                  </div>

                  {/* Rank badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-[var(--crt-magenta)] flex items-center justify-center">
                    <span className="font-terminal text-xs text-white">{index + 1}</span>
                  </div>

                  {/* Track count badge */}
                  <div className="absolute top-1.5 right-1.5 px-1.5 pb-1 rounded bg-background/80 backdrop-blur-sm leading-none">
                    <span className="font-mono text-[10px] text-[var(--crt-magenta)]">
                      {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="font-terminal text-xs text-foreground truncate">{album.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">{album.artist}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="font-mono text-base text-muted-foreground">No data yet</p>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  href,
  title,
  description,
  icon,
  gradient,
  accentColor,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  accentColor: string;
}) {
  return (
    <Link href={href} className="group block">
      <div
        className="relative h-full rounded-xl border border-border bg-card p-6 overflow-hidden transition-all duration-300 hover:border-foreground/10 hover:shadow-lg"
        style={{
          boxShadow: `0 0 0 0 ${accentColor}00`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 30px -10px ${accentColor}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 0 ${accentColor}00`;
        }}
      >
        {/* Gradient overlay on hover */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${gradient}`}
        />

        <div className="relative z-10">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4 transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            {icon}
          </div>
          <h3 className="font-terminal text-lg text-foreground mb-1 group-hover:brightness-125 transition-colors">
            {title}
          </h3>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <div
          className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-mono text-sm"
          style={{ color: accentColor }}
        >
          →
        </div>
      </div>
    </Link>
  );
}

// Utility functions
function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatHour(hour: number): string {
  if (hour === 0) return '12AM';
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return '12PM';
  return `${hour - 12}PM`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
