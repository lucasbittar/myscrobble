'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from '@/lib/date';
import { ModernCard } from '@/components/modern';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: { spotify: string };
}

interface PlayedTrack {
  track: Track;
  played_at: string;
}

async function fetchRecentTracks(limit: number): Promise<{ items: PlayedTrack[] }> {
  const res = await fetch(`/api/spotify/recent-tracks?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

interface RecentTracksProps {
  limit?: number;
  showTitle?: boolean;
}

export function RecentTracks({ limit = 10, showTitle = true }: RecentTracksProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-tracks', limit],
    queryFn: () => fetchRecentTracks(limit),
  });

  if (isLoading) {
    return (
      <ModernCard>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-secondary" />
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
    <ModernCard>
      <div className="space-y-2">
        {tracks.map((item, index) => (
          <motion.div
            key={`${item.track.id}-${item.played_at}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <a
              href={item.track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
            >
              {/* Album art */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                {item.track.album.images[0]?.url && (
                  <Image
                    src={item.track.album.images[0].url}
                    alt={item.track.album.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {item.track.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.played_at))}
                </p>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </ModernCard>
  );
}
