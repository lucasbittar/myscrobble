'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TerminalCard } from '@/components/crt';

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

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <TerminalCard title={showTitle ? "top_tracks.data" : undefined} animate={false}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="h-6 w-6 rounded bg-[#1a1a1a]" />
              <div className="h-10 w-10 rounded bg-[#1a1a1a]" />
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
      <TerminalCard title={showTitle ? "top_tracks.data" : undefined} animate={false}>
        <div className="py-4 text-center">
          <p className="font-terminal text-sm text-[#ff4444]">Error loading tracks</p>
        </div>
      </TerminalCard>
    );
  }

  const tracks = data?.items || [];

  return (
    <TerminalCard title={showTitle ? "top_tracks.data" : undefined} animate={false}>
      <div className="space-y-2">
        {tracks.map((track, index) => (
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
              className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[rgba(0,255,65,0.05)]"
            >
              {/* Rank */}
              <span className="w-6 text-center font-terminal text-lg text-[#00ff41]">
                {index + 1}
              </span>

              {/* Album art */}
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-[rgba(0,255,65,0.2)]">
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
                <p className="truncate font-terminal text-sm text-[#e0e0e0] group-hover:text-[#00ff41]">
                  {track.name}
                </p>
                <p className="truncate font-mono text-xs text-[#888888]">
                  {track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              {/* Duration */}
              <span className="font-mono text-xs text-[#555555]">
                {formatDuration(track.duration_ms)}
              </span>
            </a>
          </motion.div>
        ))}
      </div>
    </TerminalCard>
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

  return (
    <div className="space-y-2">
      {data.items.slice(0, 5).map((track, index) => (
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
            className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[rgba(0,255,65,0.05)]"
          >
            {/* Rank */}
            <span className="w-6 text-center font-terminal text-lg text-[#00ff41]">
              {index + 1}
            </span>

            {/* Album art */}
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-[rgba(0,255,65,0.2)]">
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
              <p className="truncate font-terminal text-sm text-[#e0e0e0] group-hover:text-[#00ff41]">
                {track.name}
              </p>
              <p className="truncate font-mono text-xs text-[#888888]">
                {track.artists.map((a) => a.name).join(', ')}
              </p>
            </div>
          </a>
        </motion.div>
      ))}
    </div>
  );
}
