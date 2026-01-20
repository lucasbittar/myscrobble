'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ModernCard } from '@/components/modern';

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
  showTitle = true,
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

  if (isLoading) {
    return (
      <ModernCard>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-secondary" />
              <div className="mt-2 h-4 w-3/4 rounded bg-secondary" />
            </div>
          ))}
        </div>
      </ModernCard>
    );
  }

  if (error) {
    return (
      <ModernCard>
        <div className="py-4 text-center">
          <p className="text-sm font-medium text-destructive">Error loading artists</p>
        </div>
      </ModernCard>
    );
  }

  const artists = data?.items || [];

  return (
    <ModernCard>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              {/* Artist image */}
              <div className="relative aspect-square overflow-hidden rounded-xl shadow-soft transition-all group-hover:shadow-soft-lg group-hover:scale-[1.02]">
                {artist.images[0]?.url ? (
                  <Image
                    src={artist.images[0].url}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary">
                    <span className="text-2xl opacity-30">🎵</span>
                  </div>
                )}
                {/* Rank badge */}
                <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
                {/* On Tour badge */}
                {tourStatus?.[artist.name]?.onTour && (
                  <div className="absolute bottom-2 right-2">
                    <OnTourBadge variant="compact" />
                  </div>
                )}
              </div>

              {/* Artist name */}
              <p className="mt-2 truncate text-sm font-medium text-foreground group-hover:text-primary">
                {artist.name}
              </p>

              {/* Genre */}
              {artist.genres[0] && (
                <p className="truncate text-xs text-muted-foreground">
                  {artist.genres[0]}
                </p>
              )}
            </a>
          </motion.div>
        ))}
      </div>
    </ModernCard>
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
