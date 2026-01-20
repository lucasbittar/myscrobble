'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ModernCard } from '@/components/modern';

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

export function TopAlbums({
  limit = 20,
  timeRange = 'medium_term',
  showTitle = true,
}: TopAlbumsProps) {
  const t = useTranslations('albums');
  const tCommon = useTranslations('common');
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-albums', timeRange, limit],
    queryFn: () => fetchTopAlbums(timeRange, limit),
  });

  if (isLoading) {
    return (
      <ModernCard>
        <div className="space-y-6">
          {/* Loading skeleton for featured */}
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
          {/* Loading skeleton for grid */}
          <div className="grid grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-secondary" />
            ))}
          </div>
        </div>
      </ModernCard>
    );
  }

  if (error) {
    return (
      <ModernCard>
        <div className="py-4 text-center">
          <p className="text-sm font-medium text-destructive">{t('errorLoading')}</p>
        </div>
      </ModernCard>
    );
  }

  const albums = data?.items || [];
  const featuredAlbums = albums.slice(0, 3);
  const gridAlbums = albums.slice(3);

  return (
    <ModernCard>
      <div className="space-y-8">
        {/* Featured Top 3 */}
        {featuredAlbums.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#EC4899]">★</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('featured')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredAlbums.map((album, index) => (
                <motion.a
                  key={album.id}
                  href={album.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Album cover */}
                  <div className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                    index === 0
                      ? 'shadow-[0_0_30px_rgba(236,72,153,0.3)] ring-2 ring-[#EC4899]'
                      : index === 1
                      ? 'shadow-[0_0_20px_rgba(236,72,153,0.2)] ring-1 ring-[#EC4899]/60'
                      : 'shadow-[0_0_10px_rgba(236,72,153,0.1)] ring-1 ring-[#EC4899]/40'
                  } group-hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] group-hover:scale-[1.02]`}>
                    {album.image ? (
                      <Image
                        src={album.image}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center text-[#EC4899]/50 text-4xl">
                        ♪
                      </div>
                    )}

                    {/* Rank badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-sm font-bold ${
                      index === 0
                        ? 'bg-[#EC4899] text-white shadow-soft'
                        : 'bg-background/90 text-[#EC4899] border border-[#EC4899]/50'
                    }`}>
                      #{index + 1}
                    </div>

                    {/* Track count badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm">
                      <span className="text-xs font-medium text-[#EC4899]">
                        {album.trackCount} {album.trackCount === 1 ? tCommon('track') : tCommon('tracks')}
                      </span>
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Info overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-medium text-foreground truncate">{album.name}</p>
                      <p className="text-xs text-[#EC4899] truncate">{album.artist}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Album Grid - Collection */}
        {gridAlbums.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground">◉</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('collection')}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {gridAlbums.map((album, index) => {
                const actualRank = index + 4;

                return (
                  <motion.a
                    key={album.id}
                    href={album.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    className="group relative"
                  >
                    {/* Album cover */}
                    <div className="relative aspect-square rounded-xl overflow-hidden shadow-soft transition-all duration-300 group-hover:shadow-soft-lg group-hover:scale-[1.02]">
                      {album.image ? (
                        <Image
                          src={album.image}
                          alt={album.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-[#EC4899]/30">
                          ♪
                        </div>
                      )}

                      {/* Rank badge */}
                      <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md bg-[#EC4899]/80 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{actualRank}</span>
                      </div>

                      {/* Hover overlay with info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2">
                        <p className="text-xs font-medium text-foreground truncate">{album.name}</p>
                        <p className="text-[10px] text-[#EC4899] truncate">{album.artist}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[#EC4899] text-[10px]">♫</span>
                          <span className="text-[10px] text-muted-foreground">{album.trackCount} {album.trackCount === 1 ? tCommon('track') : tCommon('tracks')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        )}

        {albums.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t('noAlbums')}</p>
          </div>
        )}
      </div>
    </ModernCard>
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
                ♪
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
