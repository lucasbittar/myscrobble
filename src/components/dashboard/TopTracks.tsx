'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ModernCard } from '@/components/modern';

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

async function fetchTopTracks(
  timeRange: string,
  limit: number
): Promise<{ items: Track[] }> {
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

export function TopTracks({
  limit = 10,
  timeRange = 'medium_term',
  showTitle = true,
}: TopTracksProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-tracks', timeRange, limit],
    queryFn: () => fetchTopTracks(timeRange, limit),
  });

  if (isLoading) {
    return (
      <ModernCard>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 p-2">
              <div className="h-8 w-12 rounded bg-secondary" />
              <div className="h-11 w-11 rounded-lg bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-secondary" />
                <div className="h-3 w-1/2 rounded bg-secondary" />
              </div>
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
          <p className="text-sm font-medium text-destructive">Error loading tracks</p>
        </div>
      </ModernCard>
    );
  }

  const tracks = data?.items || [];

  return (
    <ModernCard padding="none">
      <div className="divide-y divide-border">
        {tracks.map((track, index) => {
          const isTop3 = index < 3;

          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 p-4 transition-colors hover:bg-secondary/30"
              >
                {/* Left accent border for top 3 */}
                {isTop3 && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.03 + 0.1, duration: 0.3 }}
                    style={{ opacity: index === 0 ? 1 : index === 1 ? 0.7 : 0.4 }}
                  />
                )}

                {/* Rank badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`min-w-[42px] h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                      index === 0
                        ? 'bg-primary text-primary-foreground shadow-soft'
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
                <div className={`relative flex-shrink-0 rounded-lg overflow-hidden ${isTop3 ? 'w-12 h-12' : 'w-10 h-10'}`}>
                  {track.album.images[0]?.url ? (
                    <Image
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                      ♪
                    </div>
                  )}
                </div>

                {/* Track info */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium transition-colors ${isTop3 ? 'text-foreground' : 'text-foreground/80'} group-hover:text-primary`}>
                    {track.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {track.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>

                {/* Play indicator on hover */}
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-primary text-lg">▶</span>
                </motion.div>
              </a>
            </motion.div>
          );
        })}
      </div>
    </ModernCard>
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
