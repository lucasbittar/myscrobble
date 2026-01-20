'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TerminalCard } from '@/components/crt';
import { useTranslations } from 'next-intl';
import { getLargestImage, type SpotifyShow } from '@/lib/spotify';

interface SavedShow {
  added_at: string;
  show: SpotifyShow;
}

async function fetchSavedShows(limit: number): Promise<{ items: SavedShow[]; total: number }> {
  const res = await fetch(`/api/spotify/saved-shows?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

interface TopPodcastsProps {
  limit?: number;
  showTitle?: boolean;
}

export function TopPodcasts({ limit = 10, showTitle = true }: TopPodcastsProps) {
  const t = useTranslations('podcasts');
  const { data, isLoading, error } = useQuery({
    queryKey: ['saved-shows', limit],
    queryFn: () => fetchSavedShows(limit),
  });

  if (isLoading) {
    return (
      <TerminalCard title={showTitle ? "saved_shows.data" : undefined} animate={false}>
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
      <TerminalCard title={showTitle ? "saved_shows.data" : undefined} animate={false}>
        <div className="py-4 text-center">
          <p className="font-terminal text-sm text-[#ff4444]">Error loading podcasts</p>
        </div>
      </TerminalCard>
    );
  }

  const shows = data?.items || [];

  if (shows.length === 0) {
    return (
      <TerminalCard title={showTitle ? "saved_shows.data" : undefined} animate={false}>
        <div className="py-8 text-center">
          <p className="font-terminal text-sm text-muted-foreground">{t('noShows')}</p>
        </div>
      </TerminalCard>
    );
  }

  return (
    <TerminalCard title={showTitle ? "saved_shows.data" : undefined} animate={false}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {shows.map((item, index) => (
          <motion.div
            key={item.show.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <a
              href={item.show.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              {/* Show image */}
              <div className="relative aspect-square overflow-hidden rounded-lg border border-[rgba(168,85,247,0.2)] transition-all group-hover:border-[#a855f7] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                {getLargestImage(item.show.images) ? (
                  <Image
                    src={getLargestImage(item.show.images)!}
                    alt={item.show.name}
                    fill
                    quality={100}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#1a1a1a]">
                    <span className="text-2xl opacity-30">🎙️</span>
                  </div>
                )}
                {/* Rank badge */}
                <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0a0a0a]/80 font-terminal text-xs text-[#a855f7]">
                  {index + 1}
                </div>
                {/* Episode count badge */}
                <div className="absolute bottom-2 right-2 rounded bg-[#0a0a0a]/80 px-1.5 py-0.5 font-mono text-[10px] text-[#a855f7]">
                  {item.show.total_episodes} ep
                </div>
              </div>

              {/* Show name */}
              <p className="mt-2 truncate font-terminal text-sm text-foreground group-hover:text-[#a855f7]">
                {item.show.name}
              </p>

              {/* Publisher */}
              <p className="truncate font-mono text-xs text-muted-foreground">
                {item.show.publisher}
              </p>
            </a>
          </motion.div>
        ))}
      </div>
    </TerminalCard>
  );
}

export function TopPodcastsList({ limit = 5 }: TopPodcastsProps) {
  const t = useTranslations('podcasts');
  const { data, isLoading, error } = useQuery({
    queryKey: ['saved-shows', limit],
    queryFn: () => fetchSavedShows(limit),
  });

  if (isLoading || error || !data?.items?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {data.items.slice(0, 5).map((item, index) => (
        <motion.div
          key={item.show.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <a
            href={item.show.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[rgba(168,85,247,0.05)]"
          >
            {/* Rank */}
            <span className="w-6 text-center font-terminal text-lg text-[#a855f7]">
              {index + 1}
            </span>

            {/* Show image */}
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-[rgba(168,85,247,0.2)]">
              {getLargestImage(item.show.images) && (
                <Image
                  src={getLargestImage(item.show.images)!}
                  alt={item.show.name}
                  fill
                  quality={100}
                  sizes="40px"
                  className="object-cover"
                />
              )}
            </div>

            {/* Show info */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-terminal text-sm text-foreground group-hover:text-[#a855f7]">
                {item.show.name}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {item.show.publisher}
              </p>
            </div>

            {/* Episode count */}
            <span className="font-mono text-xs text-muted-foreground">
              {t('episodeCount', { count: item.show.total_episodes })}
            </span>
          </a>
        </motion.div>
      ))}
    </div>
  );
}
