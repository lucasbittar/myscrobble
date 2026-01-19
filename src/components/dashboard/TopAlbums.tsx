'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TerminalCard } from '@/components/crt';

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

// Vinyl Record Component
function VinylDisc({ className = "", visible = false }: { className?: string; visible?: boolean }) {
  return (
    <div className={`absolute rounded-full bg-[#1a1a1a] ${className}`}>
      {/* Outer groove */}
      <div className="absolute inset-[8%] rounded-full border border-[#333]" />
      {/* Middle grooves */}
      <div className="absolute inset-[15%] rounded-full border border-[#2a2a2a]" />
      <div className="absolute inset-[25%] rounded-full border border-[#333]" />
      <div className="absolute inset-[35%] rounded-full border border-[#2a2a2a]" />
      {/* Label */}
      <div
        className="absolute inset-[40%] rounded-full"
        style={{
          background: visible
            ? 'linear-gradient(135deg, var(--crt-magenta) 0%, #aa00aa 100%)'
            : 'linear-gradient(135deg, #444 0%, #333 100%)'
        }}
      />
      {/* Center hole */}
      <div className="absolute inset-[47%] rounded-full bg-[#1a1a1a]" />
      {/* Shine */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 via-transparent to-transparent" />
    </div>
  );
}

export function TopAlbums({
  limit = 20,
  timeRange = 'medium_term',
  showTitle = true,
}: TopAlbumsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-albums', timeRange, limit],
    queryFn: () => fetchTopAlbums(timeRange, limit),
  });

  if (isLoading) {
    return (
      <TerminalCard title={showTitle ? "top_albums.data" : undefined} animate={false}>
        <div className="space-y-6">
          {/* Loading skeleton for featured */}
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
          {/* Loading skeleton for grid */}
          <div className="grid grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        </div>
      </TerminalCard>
    );
  }

  if (error) {
    return (
      <TerminalCard title={showTitle ? "top_albums.data" : undefined} animate={false}>
        <div className="py-4 text-center">
          <p className="font-terminal text-sm text-destructive">Error loading albums</p>
        </div>
      </TerminalCard>
    );
  }

  const albums = data?.items || [];
  const featuredAlbums = albums.slice(0, 3);
  const gridAlbums = albums.slice(3);

  return (
    <TerminalCard title={showTitle ? "top_albums.data" : undefined} animate={false}>
      <div className="space-y-8">
        {/* Featured Top 3 */}
        {featuredAlbums.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[var(--crt-magenta)]">★</span>
              <span className="font-terminal text-sm text-muted-foreground uppercase tracking-wider">Featured Albums</span>
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
                  {/* Vinyl peeking from right */}
                  <div className="absolute inset-0 translate-x-3 transition-transform duration-500 group-hover:translate-x-6">
                    <VinylDisc className="w-full h-full" visible />
                  </div>

                  {/* Album cover */}
                  <div className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === 0
                      ? 'border-[var(--crt-magenta)] shadow-[0_0_30px_rgba(255,0,255,0.3)]'
                      : index === 1
                      ? 'border-[var(--crt-magenta)]/60 shadow-[0_0_20px_rgba(255,0,255,0.2)]'
                      : 'border-[var(--crt-magenta)]/40 shadow-[0_0_10px_rgba(255,0,255,0.1)]'
                  } group-hover:shadow-[0_0_40px_rgba(255,0,255,0.4)] group-hover:-translate-x-2 group-hover:-translate-y-1`}>
                    {album.image ? (
                      <Image
                        src={album.image}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center text-[var(--crt-magenta)]/50 text-4xl">
                        ♪
                      </div>
                    )}

                    {/* Rank badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded font-terminal text-sm font-bold ${
                      index === 0
                        ? 'bg-[var(--crt-magenta)] text-white shadow-[0_0_15px_var(--crt-magenta)]'
                        : 'bg-background/90 text-[var(--crt-magenta)] border border-[var(--crt-magenta)]/50'
                    }`}>
                      #{index + 1}
                    </div>

                    {/* Track count badge */}
                    <div className="absolute top-2 right-2 px-2 pb-1 rounded bg-background/80 backdrop-blur-sm leading-none">
                      <span className="font-mono text-xs text-[var(--crt-magenta)]">
                        {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'}
                      </span>
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Info overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="font-terminal text-sm text-foreground truncate">{album.name}</p>
                      <p className="font-mono text-xs text-[var(--crt-magenta)] truncate">{album.artist}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Album Grid - The Crate */}
        {gridAlbums.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground">◉</span>
              <span className="font-terminal text-sm text-muted-foreground uppercase tracking-wider">The Collection</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {gridAlbums.map((album, index) => {
                const actualRank = index + 4; // Since we start from position 4

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
                    {/* Vinyl behind - peeks on hover */}
                    <div className="absolute inset-0 translate-y-0 transition-transform duration-300 group-hover:-translate-y-2">
                      <VinylDisc className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Album cover */}
                    <div className="relative aspect-square rounded-md overflow-hidden border border-[var(--crt-magenta)]/20 transition-all duration-300 group-hover:border-[var(--crt-magenta)]/60 group-hover:shadow-[0_8px_30px_rgba(255,0,255,0.2)] group-hover:-translate-y-3">
                      {album.image ? (
                        <Image
                          src={album.image}
                          alt={album.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-[var(--crt-magenta)]/30">
                          ♪
                        </div>
                      )}

                      {/* Rank badge - corner ribbon style */}
                      <div className="absolute top-0 left-0 w-8 h-8 overflow-hidden">
                        <div className="absolute top-1 -left-3 w-12 bg-[var(--crt-magenta)]/80 text-center transform -rotate-45">
                          <span className="font-terminal text-[10px] text-white">{actualRank}</span>
                        </div>
                      </div>

                      {/* Hover overlay with info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2">
                        <p className="font-terminal text-xs text-foreground truncate">{album.name}</p>
                        <p className="font-mono text-[10px] text-[var(--crt-magenta)] truncate">{album.artist}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[var(--crt-magenta)] text-[10px]">♫</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{album.trackCount} tracks</span>
                        </div>
                      </div>

                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        )}

        {albums.length === 0 && (
          <div className="py-8 text-center">
            <p className="font-mono text-base text-muted-foreground">No albums yet</p>
          </div>
        )}
      </div>
    </TerminalCard>
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
          {/* Vinyl peek on hover */}
          <div className="absolute inset-0 transition-transform duration-300 group-hover:-translate-y-1">
            <VinylDisc className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="relative aspect-square rounded-md overflow-hidden border border-[var(--crt-magenta)]/20 transition-all duration-300 group-hover:border-[var(--crt-magenta)]/50 group-hover:-translate-y-2 group-hover:shadow-[0_8px_20px_rgba(255,0,255,0.15)]">
            {album.image ? (
              <Image
                src={album.image}
                alt={album.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-[var(--crt-magenta)]/30 text-xs">
                ♪
              </div>
            )}

            {/* Rank badge */}
            <div className="absolute top-1 left-1 w-5 h-5 rounded bg-[var(--crt-magenta)]/90 flex items-center justify-center">
              <span className="font-terminal text-[10px] text-white font-bold">{index + 1}</span>
            </div>

            {/* Hover info */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
              <p className="font-terminal text-[10px] text-foreground truncate">{album.name}</p>
              <p className="font-mono text-[8px] text-[var(--crt-magenta)] truncate">{album.artist}</p>
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
