'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ImageSkeleton } from '@/components/ui/ImageSkeleton';
import {
  containerVariants,
  heroVariants,
  featuredVariants,
  gridItemVariants,
  skeletonVariants,
  calculateExitDuration,
} from '@/lib/animations';

interface Album {
  id: string;
  name: string;
  artist: string;
  image?: string;
  spotifyUrl: string;
  trackCount: number;
}

async function fetchTopAlbums(
  timeRange: string,
  limit: number
): Promise<{ items: Album[] }> {
  const res = await fetch(
    `/api/spotify/top-albums?time_range=${timeRange}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

interface TopAlbumsProps {
  limit?: number;
  timeRange?: 'short_term' | 'medium_term' | 'long_term';
  showTitle?: boolean;
}

// Skeleton component for loading state
function TopAlbumsSkeleton() {
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
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    </motion.div>
  );
}

// Content component
function TopAlbumsContent({
  albums,
  tCommon,
  t
}: {
  albums: Album[];
  tCommon: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
}) {
  const heroAlbum = albums[0];
  const featuredAlbums = albums.slice(1, 5);
  const gridAlbums = albums.slice(5);

  return (
    <motion.div
      key="content"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-12"
    >
      {/* Hero Section - #1 Album + Featured 2-5 */}
      {heroAlbum && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* #1 Album - Hero Card */}
          <motion.a
            href={heroAlbum.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            variants={heroVariants}
            className="group relative aspect-square rounded-3xl overflow-hidden"
          >
            {/* Album Art */}
            {heroAlbum.image ? (
              <ImageSkeleton
                src={heroAlbum.image}
                alt={heroAlbum.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                    <span className="text-6xl opacity-30">💿</span>
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                <span className="text-6xl opacity-30">💿</span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* #1 Badge */}
            <div className="absolute top-6 left-6">
              <div className="px-4 py-2 rounded-full bg-[#EC4899] text-white font-bold text-lg shadow-xl shadow-[#EC4899]/30">
                #1
              </div>
            </div>

            {/* Track Count Badge */}
            <div className="absolute top-6 right-6">
              <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                {heroAlbum.trackCount} {heroAlbum.trackCount === 1 ? tCommon('track') : tCommon('tracks')}
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 group-hover:text-[#EC4899] transition-colors">
                {heroAlbum.name}
              </h2>
              <p className="text-white/70 text-lg">
                {heroAlbum.artist}
              </p>
            </div>

            {/* Hover border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#EC4899]/50 transition-colors" />
          </motion.a>

          {/* Featured Albums 2-5 */}
          <div className="grid grid-cols-2 gap-4">
            {featuredAlbums.map((album, index) => (
              <motion.a
                key={album.id}
                href={album.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                variants={featuredVariants}
                className="group relative aspect-square rounded-2xl overflow-hidden"
              >
                {/* Image */}
                {album.image ? (
                  <ImageSkeleton
                    src={album.image}
                    alt={album.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    fallback={
                      <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                        <span className="text-3xl opacity-30">💿</span>
                      </div>
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                    <span className="text-3xl opacity-30">💿</span>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Rank Badge */}
                <div className="absolute top-3 left-3">
                  <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-foreground">{index + 2}</span>
                  </div>
                </div>

                {/* Track Count Badge */}
                <div className="absolute top-3 right-3">
                  <div className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                    {album.trackCount} {album.trackCount === 1 ? tCommon('track') : tCommon('tracks')}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold truncate group-hover:text-[#EC4899] transition-colors">
                    {album.name}
                  </p>
                  <p className="text-white/60 text-sm truncate">
                    {album.artist}
                  </p>
                </div>

                {/* Hover border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#EC4899]/50 transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* Remaining Albums - Open Grid */}
      {gridAlbums.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-[#EC4899] to-transparent" />
            <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {t('collection')}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gridAlbums.map((album, index) => {
              const actualRank = index + 6;
              return (
                <motion.a
                  key={album.id}
                  href={album.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={gridItemVariants}
                  className="group relative"
                >
                  {/* Card with glass effect */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#EC4899]/10 group-hover:border-[#EC4899]/30">
                    {/* Image */}
                    {album.image ? (
                      <ImageSkeleton
                        src={album.image}
                        alt={album.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        fallback={
                          <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                            <span className="text-2xl opacity-30">💿</span>
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                        <span className="text-2xl opacity-30">💿</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Rank */}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-foreground/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-background">{actualRank}</span>
                    </div>

                    {/* Hover info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium truncate">{album.name}</p>
                      <p className="text-white/60 text-xs truncate">{album.artist}</p>
                      <p className="text-[#EC4899] text-xs mt-1">
                        {album.trackCount} {album.trackCount === 1 ? tCommon('track') : tCommon('tracks')}
                      </p>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      )}

      {albums.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t('noAlbums')}</p>
        </div>
      )}
    </motion.div>
  );
}

export function TopAlbums({
  limit = 20,
  timeRange = 'medium_term',
}: TopAlbumsProps) {
  const t = useTranslations('albums');
  const tCommon = useTranslations('common');

  // Track what we're currently displaying vs what's requested
  const [displayedTimeRange, setDisplayedTimeRange] = useState(timeRange);
  const [showContent, setShowContent] = useState(true);
  const isFirstMount = useRef(true);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['top-albums', timeRange, limit],
    queryFn: () => fetchTopAlbums(timeRange, limit),
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
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t('errorLoading')}</p>
      </div>
    );
  }

  const albums = data?.items || [];

  return (
    <AnimatePresence mode="wait">
      {!showContent || isFetching ? (
        <TopAlbumsSkeleton />
      ) : (
        <TopAlbumsContent albums={albums} tCommon={tCommon} t={t} />
      )}
    </AnimatePresence>
  );
}

export function TopAlbumsList({
  limit = 6,
  timeRange = 'medium_term',
}: TopAlbumsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-albums', timeRange, limit],
    queryFn: () => fetchTopAlbums(timeRange, limit),
  });

  if (isLoading || error || !data?.items) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {data.items.slice(0, 6).map((album, index) => (
        <motion.a
          key={album.id}
          href={album.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="group relative"
        >
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-soft transition-all duration-300 group-hover:shadow-soft-lg group-hover:scale-[1.02]">
            {album.image ? (
              <Image
                src={album.image}
                alt={album.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-[#EC4899]/30 text-xs">
                💿
              </div>
            )}

            {/* Rank badge */}
            <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-[#EC4899]/90 flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{index + 1}</span>
            </div>

            {/* Hover info */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
              <p className="text-[10px] font-medium text-foreground truncate">{album.name}</p>
              <p className="text-[8px] text-[#EC4899] truncate">{album.artist}</p>
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
