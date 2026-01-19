'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TerminalCard } from '@/components/crt';

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

  if (isLoading) {
    return (
      <TerminalCard title={showTitle ? "top_artists.data" : undefined} animate={false}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-lg bg-[#1a1a1a]" />
              <div className="mt-2 h-4 w-3/4 rounded bg-[#1a1a1a]" />
            </div>
          ))}
        </div>
      </TerminalCard>
    );
  }

  if (error) {
    return (
      <TerminalCard title={showTitle ? "top_artists.data" : undefined} animate={false}>
        <div className="py-4 text-center">
          <p className="font-terminal text-sm text-[#ff4444]">Error loading artists</p>
        </div>
      </TerminalCard>
    );
  }

  const artists = data?.items || [];

  return (
    <TerminalCard title={showTitle ? "top_artists.data" : undefined} animate={false}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
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
              <div className="relative aspect-square overflow-hidden rounded-lg border border-[rgba(0,255,65,0.2)] transition-all group-hover:border-[#00ff41] group-hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                {artist.images[0]?.url ? (
                  <Image
                    src={artist.images[0].url}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#1a1a1a]">
                    <span className="text-2xl opacity-30">🎵</span>
                  </div>
                )}
                {/* Rank badge */}
                <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0a0a0a]/80 font-terminal text-xs text-[#00ff41]">
                  {index + 1}
                </div>
              </div>

              {/* Artist name */}
              <p className="mt-2 truncate font-terminal text-sm text-[#e0e0e0] group-hover:text-[#00ff41]">
                {artist.name}
              </p>

              {/* Genre */}
              {artist.genres[0] && (
                <p className="truncate font-mono text-xs text-[#555555]">
                  {artist.genres[0]}
                </p>
              )}
            </a>
          </motion.div>
        ))}
      </div>
    </TerminalCard>
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
            className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[rgba(0,255,65,0.05)]"
          >
            {/* Rank */}
            <span className="w-6 text-center font-terminal text-lg text-[#00ff41]">
              {index + 1}
            </span>

            {/* Artist image */}
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[rgba(0,255,65,0.2)]">
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
              <p className="truncate font-terminal text-sm text-[#e0e0e0] group-hover:text-[#00ff41]">
                {artist.name}
              </p>
              {artist.genres[0] && (
                <p className="truncate font-mono text-xs text-[#555555]">
                  {artist.genres[0]}
                </p>
              )}
            </div>
          </a>
        </motion.div>
      ))}
    </div>
  );
}
