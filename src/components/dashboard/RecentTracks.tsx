'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TerminalCard } from '@/components/crt';
import { formatDistanceToNow } from '@/lib/date';

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
      <TerminalCard title={showTitle ? "recent_tracks.log" : undefined} animate={false}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="h-12 w-12 rounded bg-[#1a1a1a]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[#1a1a1a]" />
                <div className="h-3 w-1/2 rounded bg-[#1a1a1a]" />
              </div>
            </div>
          ))}
        </div>
      </TerminalCard>
    );
  }

  if (error) {
    return (
      <TerminalCard title={showTitle ? "recent_tracks.log" : undefined} animate={false}>
        <div className="py-4 text-center">
          <p className="font-terminal text-sm text-[#ff4444]">Error loading tracks</p>
        </div>
      </TerminalCard>
    );
  }

  const tracks = data?.items || [];

  return (
    <TerminalCard title={showTitle ? "recent_tracks.log" : undefined} animate={false}>
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
              className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[rgba(0,255,65,0.05)]"
            >
              {/* Album art */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-[rgba(0,255,65,0.2)]">
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
                <p className="truncate font-terminal text-sm text-[#e0e0e0] group-hover:text-[#00ff41]">
                  {item.track.name}
                </p>
                <p className="truncate font-mono text-xs text-[#888888]">
                  {item.track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              {/* Time */}
              <div className="flex-shrink-0 text-right">
                <p className="font-mono text-xs text-[#555555]">
                  {formatDistanceToNow(new Date(item.played_at))}
                </p>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </TerminalCard>
  );
}
