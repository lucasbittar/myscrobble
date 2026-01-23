'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getLargestImage, type SpotifyEpisode } from '@/lib/spotify';
import { ModernCard, ModernBadge } from '@/components/modern';

interface SavedEpisode {
  added_at: string;
  episode: SpotifyEpisode;
}

async function fetchSavedEpisodes(limit: number): Promise<{ items: SavedEpisode[]; total: number }> {
  const res = await fetch(`/api/spotify/saved-episodes?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
}

function formatReleaseDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface LatestEpisodesProps {
  limit?: number;
  showTitle?: boolean;
}

export function LatestEpisodes({ limit = 10, showTitle = true }: LatestEpisodesProps) {
  const t = useTranslations('podcasts');
  const { data, isLoading, error } = useQuery({
    queryKey: ['saved-episodes', limit],
    queryFn: () => fetchSavedEpisodes(limit),
  });

  if (isLoading) {
    return (
      <ModernCard>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-16 h-16 rounded-xl bg-secondary" />
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
          <p className="text-sm font-medium text-destructive">Error loading episodes</p>
        </div>
      </ModernCard>
    );
  }

  const episodes = data?.items || [];

  if (episodes.length === 0) {
    return (
      <ModernCard>
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t('noEpisodes')}</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard padding="none">
      <div className="divide-y divide-border">
        {episodes.map((item, index) => (
          <motion.div
            key={item.episode.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <a
              href={item.episode.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 p-4 transition-colors hover:bg-secondary/30"
            >
              {/* Episode image */}
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl">
                {getLargestImage(item.episode.images) ? (
                  <Image
                    src={getLargestImage(item.episode.images)!}
                    alt={item.episode.name}
                    fill
                    quality={100}
                    sizes="64px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                    <span className="text-lg opacity-30">🎙️</span>
                  </div>
                )}
                {/* Play indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[#8B5CF6] text-xl">▶</span>
                </div>
              </div>

              {/* Episode info */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-[#8B5CF6]">
                  {item.episode.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.episode.show.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <ModernBadge color="purple" size="sm">
                    {formatDuration(item.episode.duration_ms)}
                  </ModernBadge>
                  <span className="text-xs text-muted-foreground">
                    {formatReleaseDate(item.episode.release_date)}
                  </span>
                </div>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </ModernCard>
  );
}
