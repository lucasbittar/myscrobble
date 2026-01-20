'use client';

import Image from 'next/image';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
}

async function fetchTopArtists(
  timeRange: string,
  limit: number
): Promise<{ items: Artist[] }> {
  const res = await fetch(
    `/api/spotify/top-artists?time_range=${timeRange}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

interface TopArtistsProps {
  limit?: number;
  timeRange?: 'short_term' | 'medium_term' | 'long_term';
  showTitle?: boolean;
}

export function TopArtists({
  limit = 10,
  timeRange = 'medium_term',
}: TopArtistsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-artists', timeRange, limit],
    queryFn: () => fetchTopArtists(timeRange, limit),
    placeholderData: keepPreviousData,
  });

  // Tour status for badges
  const { location } = useGeolocation();
  const artistNames = data?.items?.map((a) => a.name) || [];
  const { data: tourStatus } = useTourStatusBatch(
    artistNames,
    location?.lat,
    location?.lng
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Hero skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square rounded-3xl bg-white/50 dark:bg-white/5 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-white/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Error loading artists</p>
      </div>
    );
  }

  const artists = data?.items || [];
  const heroArtist = artists[0];
  const featuredArtists = artists.slice(1, 5);
  const gridArtists = artists.slice(5);

  return (
    <div className="space-y-12">
      {/* Hero Section - #1 Artist + Featured 2-5 */}
      {heroArtist && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* #1 Artist - Hero Card */}
          <motion.a
            href={heroArtist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="group relative aspect-square rounded-3xl overflow-hidden"
          >
            {/* Background Image */}
            {heroArtist.images[0]?.url ? (
              <Image
                src={heroArtist.images[0].url}
                alt={heroArtist.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
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

            {/* Tour Badge */}
            {tourStatus?.[heroArtist.name]?.onTour && (
              <div className="absolute top-6 right-6">
                <OnTourBadge variant="compact" />
              </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2 group-hover:text-[#1DB954] transition-colors">
                {heroArtist.name}
              </h2>
              {heroArtist.genres[0] && (
                <p className="text-white/70 text-lg">
                  {heroArtist.genres.slice(0, 2).join(' • ')}
                </p>
              )}
            </div>

            {/* Hover border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#1DB954]/50 transition-colors" />
          </motion.a>

          {/* Featured Artists 2-5 */}
          <div className="grid grid-cols-2 gap-4">
            {featuredArtists.map((artist, index) => (
              <motion.a
                key={artist.id}
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="group relative aspect-square rounded-2xl overflow-hidden"
              >
                {/* Image */}
                {artist.images[0]?.url ? (
                  <Image
                    src={artist.images[0].url}
                    alt={artist.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                    <span className="text-3xl opacity-30">🎵</span>
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

                {/* Tour Badge */}
                {tourStatus?.[artist.name]?.onTour && (
                  <div className="absolute top-3 right-3">
                    <OnTourBadge variant="compact" />
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold truncate group-hover:text-[#1DB954] transition-colors">
                    {artist.name}
                  </p>
                  {artist.genres[0] && (
                    <p className="text-white/60 text-sm truncate">
                      {artist.genres[0]}
                    </p>
                  )}
                </div>

                {/* Hover border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#1DB954]/50 transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* Remaining Artists - Open Grid */}
      {gridArtists.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-[#1DB954] to-transparent" />
            <span className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              More Artists
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gridArtists.map((artist, index) => {
              const actualRank = index + 6;
              return (
                <motion.a
                  key={artist.id}
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  className="group relative"
                >
                  {/* Card with glass effect */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#1DB954]/10 group-hover:border-[#1DB954]/30">
                    {/* Image */}
                    {artist.images[0]?.url ? (
                      <Image
                        src={artist.images[0].url}
                        alt={artist.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/10 to-[#8B5CF6]/10 flex items-center justify-center">
                        <span className="text-2xl opacity-30">🎵</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Rank */}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-foreground/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-background">{actualRank}</span>
                    </div>

                    {/* Tour Badge */}
                    {tourStatus?.[artist.name]?.onTour && (
                      <div className="absolute top-2 right-2">
                        <OnTourBadge variant="compact" />
                      </div>
                    )}

                    {/* Hover info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                      {artist.genres[0] && (
                        <p className="text-white/60 text-xs truncate">{artist.genres[0]}</p>
                      )}
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopArtistsList({
  limit = 10,
  timeRange = 'medium_term',
}: TopArtistsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-artists', timeRange, limit],
    queryFn: () => fetchTopArtists(timeRange, limit),
  });

  // Tour status for badges
  const { location } = useGeolocation();
  const artistNames = data?.items?.map((a) => a.name) || [];
  const { data: tourStatus } = useTourStatusBatch(
    artistNames,
    location?.lat,
    location?.lng
  );

  if (isLoading || error || !data?.items) {
    return null;
  }

  return (
    <div className="space-y-2">
      {data.items.slice(0, 5).map((artist, index) => (
        <motion.div
          key={artist.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <a
            href={artist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
          >
            {/* Rank */}
            <span className="w-6 text-center text-lg font-bold text-primary">
              {index + 1}
            </span>

            {/* Artist image */}
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              {artist.images[0]?.url && (
                <Image
                  src={artist.images[0].url}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Artist info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                {artist.name}
              </p>
              {artist.genres[0] && (
                <p className="truncate text-xs text-muted-foreground">
                  {artist.genres[0]}
                </p>
              )}
            </div>

            {/* On Tour badge */}
            {tourStatus?.[artist.name]?.onTour && (
              <OnTourBadge variant="badge" />
            )}
          </a>
        </motion.div>
      ))}
    </div>
  );
}
