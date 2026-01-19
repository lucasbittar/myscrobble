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
            <div key={i} className="flex animate-pulse items-center gap-3 p-2">
              <div className="h-8 w-12 rounded bg-secondary" />
              <div className="h-11 w-11 rounded-md bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-secondary" />
                <div className="h-3 w-1/2 rounded bg-secondary" />
              </div>
              <div className="h-5 w-12 rounded bg-secondary" />
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
          <p className="font-terminal text-sm text-destructive">Error loading tracks</p>
        </div>
      </TerminalCard>
    );
  }

  const tracks = data?.items || [];

  return (
    <TerminalCard title={showTitle ? "top_tracks.data" : undefined} animate={false}>
      <div>
        {tracks.map((track, index) => {
          const isTop3 = index < 3;
          const glowIntensity = index === 0 ? 1 : index === 1 ? 0.6 : index === 2 ? 0.3 : 0;

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
                className="group relative flex items-center gap-3 p-3 pl-5 transition-colors hover:bg-primary/5 border-b border-primary/10 last:border-b-0"
              >
                {/* Left accent border for top 3 */}
                {isTop3 && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.03 + 0.1, duration: 0.3 }}
                    style={{ opacity: 0.3 + glowIntensity * 0.7 }}
                  />
                )}

                {/* Rank badge - Terminal style */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    className={`min-w-[42px] h-8 rounded flex items-center justify-center font-terminal text-sm font-bold transition-all duration-300 ${
                      index === 0
                        ? 'bg-primary text-background shadow-[0_0_20px_var(--primary)]'
                        : index === 1
                        ? 'bg-primary/60 text-background shadow-[0_0_12px_var(--primary)]'
                        : index === 2
                        ? 'bg-primary/40 text-background shadow-[0_0_6px_var(--primary)]'
                        : 'bg-primary/10 text-primary/70'
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.03 + 0.05, type: "spring", stiffness: 200 }}
                  >
                    <span className="opacity-50">[</span>
                    {String(index + 1).padStart(2, '0')}
                    <span className="opacity-50">]</span>
                  </motion.div>
                </div>

                {/* Album art */}
                <div className={`relative z-10 flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 ${isTop3 ? 'w-12 h-12 border-2' : 'w-10 h-10 border'} ${index === 0 ? 'border-primary/60' : index === 1 ? 'border-primary/40' : index === 2 ? 'border-primary/30' : 'border-primary/20'} group-hover:border-primary/80`}>
                  {track.album.images[0]?.url ? (
                    <Image
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/50">
                      ♪
                    </div>
                  )}
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Track info */}
                <div className="relative z-10 min-w-0 flex-1">
                  <p className={`truncate font-terminal transition-colors ${isTop3 ? 'text-sm text-foreground' : 'text-sm text-foreground/80'} group-hover:text-primary`}>
                    {track.name}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {track.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>

                {/* Frequency bars - decorative */}
                <div className="relative z-10 flex-shrink-0 flex items-center gap-3">
                  <div className="hidden sm:flex items-end gap-0.5 h-5">
                    {[0.3, 0.6, 1, 0.5, 0.8].map((height, i) => (
                      <motion.div
                        key={i}
                        className={`w-1 rounded-sm ${isTop3 ? 'bg-primary/60' : 'bg-primary/30'}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${height * 100}%` }}
                        transition={{
                          delay: index * 0.03 + 0.2 + i * 0.05,
                          duration: 0.4,
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 2 + i * 0.5
                        }}
                      />
                    ))}
                  </div>

                  {/* Play indicator on hover */}
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-primary text-lg">▶</span>
                  </motion.div>
                </div>

                {/* Scanline hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5"
                    initial={{ y: '-100%' }}
                    whileHover={{ y: '100%' }}
                    transition={{ duration: 0.6, ease: "linear" }}
                  />
                </div>
              </a>
            </motion.div>
          );
        })}
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

  const tracks = data.items.slice(0, 5);

  return (
    <div>
      {tracks.map((track, index) => {
        const isTop3 = index < 3;
        const glowIntensity = index === 0 ? 1 : index === 1 ? 0.6 : index === 2 ? 0.3 : 0;

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
              className="group relative flex items-center gap-3 p-2 transition-colors hover:bg-primary/5 border-b border-primary/10 last:border-b-0"
            >
              {/* Left accent for top 3 */}
              {isTop3 && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                  style={{ opacity: 0.3 + glowIntensity * 0.7 }}
                />
              )}

              {/* Rank */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`min-w-[36px] h-7 rounded flex items-center justify-center font-terminal text-xs font-bold ${
                    index === 0
                      ? 'bg-primary text-background'
                      : index === 1
                      ? 'bg-primary/60 text-background'
                      : index === 2
                      ? 'bg-primary/40 text-background'
                      : 'bg-primary/10 text-primary/70'
                  }`}
                >
                  <span className="opacity-50">[</span>
                  {String(index + 1).padStart(2, '0')}
                  <span className="opacity-50">]</span>
                </div>
              </div>

              {/* Album art */}
              <div className={`relative z-10 flex-shrink-0 overflow-hidden rounded ${isTop3 ? 'w-10 h-10' : 'w-9 h-9'} border border-primary/20`}>
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
              <div className="relative z-10 min-w-0 flex-1">
                <p className={`truncate font-terminal text-sm ${isTop3 ? 'text-foreground' : 'text-foreground/80'} group-hover:text-primary`}>
                  {track.name}
                </p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              {/* Frequency bars */}
              <div className="relative z-10 flex items-end gap-0.5 h-4">
                {[0.3, 0.6, 1, 0.5, 0.8].map((height, i) => (
                  <motion.div
                    key={i}
                    className={`w-0.5 rounded-sm ${isTop3 ? 'bg-primary/50' : 'bg-primary/30'}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${height * 100}%` }}
                    transition={{
                      delay: index * 0.05 + 0.2 + i * 0.05,
                      duration: 0.4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 2 + i * 0.5
                    }}
                  />
                ))}
              </div>
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}
