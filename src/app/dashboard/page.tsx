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

// Fetch functions
async function fetchNowPlaying(): Promise<NowPlayingData> {
  const res = await fetch('/api/spotify/now-playing');
  if (!res.ok) return { isPlaying: false };
  return res.json();
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
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
            {/* Album Art */}
            <div className="relative flex-shrink-0">
              {nowPlaying?.isPlaying && nowPlaying.track?.albumArt ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-xl overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_var(--primary)/15]">
                    <Image
                      src={nowPlaying.track.albumArt}
                      alt={nowPlaying.track.album}
                      fill
                      className="object-cover"
                    />
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
              ) : (
                <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center bg-primary/5">
                  <div className="text-center">
                    <span className="text-4xl opacity-30">♪</span>
                    <p className="mt-2 font-terminal text-xs text-muted-foreground">Not playing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {nowPlaying?.isPlaying ? 'Now Playing' : 'Nothing Playing'}
              </p>
              {nowPlaying?.isPlaying && nowPlaying.track ? (
                <>
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
                </>
              ) : (
                <div>
                  <h2 className="font-terminal text-3xl sm:text-4xl text-foreground mb-2">
                    {greeting}{userName && `, ${userName}`}
                  </h2>
                  <p className="font-mono text-base text-muted-foreground">
                    Play something on Spotify to see it here
                  </p>
                </div>
              )}
            </div>
          </div>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
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

          <TerminalCard animate={false}>
            {recentTracks && recentTracks.length > 0 ? (
              <div className="divide-y divide-border">
                {recentTracks.map((track, index) => (
                  <motion.div
                    key={`${track.id}-${track.playedAt}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 py-3 group"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                      {track.albumArt ? (
                        <Image
                          src={track.albumArt}
                          alt={track.album}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                          ♪
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-terminal text-base text-foreground truncate group-hover:text-primary transition-colors">
                        {track.name}
                      </p>
                      <p className="font-mono text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground/70 flex-shrink-0">
                      {formatRelativeTime(track.playedAt)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="font-mono text-base text-muted-foreground">No recent tracks</p>
              </div>
            )}
          </TerminalCard>
        </motion.section>

        {/* Top Artists */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-terminal text-xl">
              <GlowText color="cyan" size="sm">
                <span className="text-muted-foreground">▲</span> Top Artists
              </GlowText>
            </h2>
            <Link
              href="/dashboard/top"
              className="font-mono text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>

          <TerminalCard animate={false}>
            {topArtists && topArtists.length > 0 ? (
              <div className="space-y-3">
                {topArtists.map((artist, index) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="font-terminal text-lg text-muted-foreground/50 w-5 text-right">
                      {index + 1}
                    </span>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-accent/20">
                      {artist.image ? (
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-terminal text-base text-foreground truncate group-hover:text-accent transition-colors">
                        {artist.name}
                      </p>
                      {artist.genres.length > 0 && (
                        <p className="font-mono text-xs text-muted-foreground truncate">
                          {artist.genres.join(' • ')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="font-mono text-base text-muted-foreground">No data yet</p>
              </div>
            )}
          </TerminalCard>
        </motion.section>
      </div>
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
