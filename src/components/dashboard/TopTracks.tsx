'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageSkeleton } from '@/components/ui/ImageSkeleton';
import {
  containerVariants,
  heroVariants,
  featuredTrackVariants,
  listItemVariants,
  skeletonVariants,
  calculateExitDuration,
} from '@/lib/animations';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
}

interface EnrichedTrack {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  spotifyUrl: string;
  durationMs: number;
  count: number;
}

async function fetchTopTracks(
  timeRange: string,
  limit: number
): Promise<{ items: Track[] }> {
  // For short_term (4 weeks), use enriched stats endpoint (listening history)
  if (timeRange === 'short_term') {
    const res = await fetch(`/api/stats/enriched?track_limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    // Map enriched data to Track interface
    return {
      items: (data.top_tracks || []).map((t: EnrichedTrack) => ({
        id: t.id,
        name: t.name,
        artists: [{ name: t.artist }],
        album: {
          name: '',
          images: t.albumArt ? [{ url: t.albumArt }] : [],
        },
        duration_ms: t.durationMs,
        external_urls: { spotify: t.spotifyUrl },
      })),
    };
  }

  // For medium_term and long_term, use Spotify API
  const res = await fetch(
    `/api/spotify/top-tracks?time_range=${timeRange}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

interface TopTracksProps {
  limit?: number;
  timeRange?: 'short_term' | 'medium_term' | 'long_term';
  showTitle?: boolean;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Skeleton component for loading state
function TopTracksSkeleton() {
  return (
    <motion.div
      key="skeleton"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="aspect-square rounded-3xl bg-white/50 dark:bg-white/5 animate-pulse" />
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
      {/* List skeleton */}
      <div className="space-y-2">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/50 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </motion.div>
  );
}

// Content component
function TopTracksContent({ tracks }: { tracks: Track[] }) {
  const heroTrack = tracks[0];
  const featuredTracks = tracks.slice(1, 5);
  const listTracks = tracks.slice(5);

  return (
    <motion.div
      key="content"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-12"
    >
      {/* Hero Section - #1 Track + Featured 2-5 */}
      {heroTrack && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* #1 Track - Hero Card */}
          <motion.a
            href={heroTrack.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            variants={heroVariants}
            className="group relative aspect-square rounded-3xl overflow-hidden"
          >
            {/* Album Art */}
            {heroTrack.album.images[0]?.url ? (
              <ImageSkeleton
                src={heroTrack.album.images[0].url}
                alt={heroTrack.album.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                    <span className="text-6xl opacity-30">🎵</span>
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                <span className="text-6xl opacity-30">🎵</span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* #1 Badge */}
            <div className="absolute top-6 left-6">
              <div className="px-4 py-2 rounded-full bg-[#1DB954] text-white font-bold text-lg shadow-xl shadow-[#1DB954]/30">
                #1
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute top-6 right-6">
              <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                {formatDuration(heroTrack.duration_ms)}
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 group-hover:text-[#1DB954] transition-colors">
                {heroTrack.name}
              </h2>
              <p className="text-white/70 text-lg">
                {heroTrack.artists.map((a) => a.name).join(', ')}
              </p>
              <p className="text-white/50 text-sm mt-1">
                {heroTrack.album.name}
              </p>
            </div>

            {/* Hover border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#1DB954]/50 transition-colors" />
          </motion.a>

          {/* Featured Tracks 2-5 */}
          <div className="flex flex-col gap-3">
            {featuredTracks.map((track, index) => (
              <motion.a
                key={track.id}
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                variants={featuredTrackVariants}
                className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-300 hover:bg-white/70 dark:hover:bg-white/10 hover:shadow-xl hover:shadow-[#1DB954]/10 hover:border-[#1DB954]/30"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{index + 2}</span>
                </div>

                {/* Album Art */}
                <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden">
                  {track.album.images[0]?.url ? (
                    <ImageSkeleton
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      fallback={
                        <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                          <span className="text-lg opacity-30">🎵</span>
                        </div>
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                      <span className="text-lg opacity-30">🎵</span>
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate group-hover:text-[#1DB954] transition-colors">
                    {track.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>

                {/* Duration */}
                <div className="flex-shrink-0 text-sm text-muted-foreground">
                  {formatDuration(track.duration_ms)}
                </div>

                {/* Play indicator */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm ml-0.5">▶</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* Remaining Tracks - Elegant List */}
      {listTracks.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-[#1DB954] to-transparent" />
            <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              More Tracks
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="space-y-2">
            {listTracks.map((track, index) => {
              const actualRank = index + 6;
              return (
                <motion.a
                  key={track.id}
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={listItemVariants}
                  className="group flex items-center gap-4 p-3 rounded-xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-transparent hover:border-[#1DB954]/30 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300"
                >
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full bg-foreground/80 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-background">{actualRank}</span>
                  </div>

                  {/* Album Art */}
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
                    {track.album.images[0]?.url ? (
                      <ImageSkeleton
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        fallback={
                          <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                            <span className="text-sm opacity-30">🎵</span>
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                        <span className="text-sm opacity-30">🎵</span>
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-[#1DB954] transition-colors">
                      {track.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="text-sm text-muted-foreground flex-shrink-0 hidden sm:block">
                    {formatDuration(track.duration_ms)}
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function TopTracks({
  limit = 10,
  timeRange = 'medium_term',
}: TopTracksProps) {
  // Track what we're currently displaying vs what's requested
  const [displayedTimeRange, setDisplayedTimeRange] = useState(timeRange);
  const [showContent, setShowContent] = useState(true);
  const isFirstMount = useRef(true);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['top-tracks', timeRange, limit],
    queryFn: () => fetchTopTracks(timeRange, limit),
  });

  // Handle timeRange changes - trigger exit animation
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (timeRange !== displayedTimeRange) {
      // Clear any pending timeout
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }

      // Start exit animation by hiding content
      setShowContent(false);

      // After exit animation completes, update displayed timeRange
      const exitDuration = calculateExitDuration(data?.items?.length || 20);
      exitTimeoutRef.current = setTimeout(() => {
        setDisplayedTimeRange(timeRange);
      }, exitDuration * 1000);
    }

    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [timeRange, displayedTimeRange, data?.items?.length]);

  // Show content when data for the new timeRange arrives
  useEffect(() => {
    if (!showContent && displayedTimeRange === timeRange && data && !isFetching) {
      setShowContent(true);
    }
  }, [showContent, displayedTimeRange, timeRange, data, isFetching]);

  // Initial loading state (first load only)
  if (isLoading && isFirstMount.current) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="aspect-square rounded-3xl bg-white/50 dark:bg-white/5 animate-pulse" />
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[88px] rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Error loading tracks</p>
      </div>
    );
  }

  const tracks = data?.items || [];

  return (
    <AnimatePresence mode="wait">
      {!showContent || isFetching ? (
        <TopTracksSkeleton />
      ) : (
        <TopTracksContent tracks={tracks} />
      )}
    </AnimatePresence>
  );
}

export function TopTracksList({
  limit = 5,
  timeRange = 'medium_term',
}: TopTracksProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-tracks', timeRange, limit],
    queryFn: () => fetchTopTracks(timeRange, limit),
  });

  if (isLoading || error || !data?.items) {
    return null;
  }

  const tracks = data.items.slice(0, 5);

  return (
    <div className="divide-y divide-border">
      {tracks.map((track, index) => {
        const isTop3 = index < 3;

        return (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 p-2 transition-colors hover:bg-secondary/30"
            >
              {/* Left accent for top 3 */}
              {isTop3 && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                  style={{ opacity: index === 0 ? 1 : index === 1 ? 0.7 : 0.4 }}
                />
              )}

              {/* Rank */}
              <div className="flex-shrink-0">
                <div
                  className={`min-w-[36px] h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-primary text-primary-foreground'
                      : index === 1
                      ? 'bg-primary/60 text-primary-foreground'
                      : index === 2
                      ? 'bg-primary/40 text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Album art */}
              <div className={`relative flex-shrink-0 overflow-hidden rounded-lg ${isTop3 ? 'w-10 h-10' : 'w-9 h-9'}`}>
                {track.album.images[0]?.url && (
                  <Image
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${isTop3 ? 'text-foreground' : 'text-foreground/80'} group-hover:text-primary`}>
                  {track.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}
