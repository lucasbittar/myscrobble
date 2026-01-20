'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlowText, TerminalCard, TerminalButton } from '@/components/crt';
import { useTranslations } from 'next-intl';
import { getLargestImage, type SpotifyShow, type SpotifyEpisode } from '@/lib/spotify';

type Tab = 'shows' | 'episodes';

interface SavedShow {
  added_at: string;
  show: SpotifyShow;
}

interface SavedEpisode {
  added_at: string;
  episode: SpotifyEpisode;
}

async function fetchSavedShows(limit: number, offset: number): Promise<{ items: SavedShow[]; total: number }> {
  const res = await fetch(`/api/spotify/saved-shows?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function fetchSavedEpisodes(limit: number, offset: number): Promise<{ items: SavedEpisode[]; total: number }> {
  const res = await fetch(`/api/spotify/saved-episodes?limit=${limit}&offset=${offset}`);
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

const ITEMS_PER_PAGE = 20;

export default function PodcastsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('shows');
  const [showsPage, setShowsPage] = useState(0);
  const [episodesPage, setEpisodesPage] = useState(0);
  const t = useTranslations('podcasts');
  const tCommon = useTranslations('common');

  const { data: showsData, isLoading: showsLoading } = useQuery({
    queryKey: ['saved-shows-page', showsPage],
    queryFn: () => fetchSavedShows(ITEMS_PER_PAGE, showsPage * ITEMS_PER_PAGE),
  });

  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    queryKey: ['saved-episodes-page', episodesPage],
    queryFn: () => fetchSavedEpisodes(ITEMS_PER_PAGE, episodesPage * ITEMS_PER_PAGE),
  });

  const showsTotalPages = Math.ceil((showsData?.total || 0) / ITEMS_PER_PAGE);
  const episodesTotalPages = Math.ceil((episodesData?.total || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-terminal text-3xl">
            <GlowText color="purple" size="sm">
              <span className="text-muted-foreground">◉</span> {t('title')}
            </GlowText>
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2">
          <TerminalButton
            variant={activeTab === 'shows' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('shows')}
          >
            {t('tabs.shows')}
          </TerminalButton>
          <TerminalButton
            variant={activeTab === 'episodes' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('episodes')}
          >
            {t('tabs.episodes')}
          </TerminalButton>
        </div>
      </motion.div>

      {/* Content */}
      {activeTab === 'shows' ? (
        <motion.div
          key="shows"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {showsLoading ? (
            <TerminalCard>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square rounded-lg bg-secondary" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-secondary" />
                    <div className="mt-1 h-3 w-1/2 rounded bg-secondary" />
                  </div>
                ))}
              </div>
            </TerminalCard>
          ) : showsData?.items && showsData.items.length > 0 ? (
            <>
              <TerminalCard>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {showsData.items.map((item, index) => (
                    <motion.a
                      key={item.show.id}
                      href={item.show.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group block"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-[rgba(168,85,247,0.2)] transition-all group-hover:border-[#a855f7] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        {getLargestImage(item.show.images) ? (
                          <Image
                            src={getLargestImage(item.show.images)!}
                            alt={item.show.name}
                            fill
                            quality={100}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary">
                            <span className="text-3xl opacity-30">🎙️</span>
                          </div>
                        )}
                        {/* Episode count badge */}
                        <div className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 font-mono text-xs text-[#a855f7]">
                          {t('episodeCount', { count: item.show.total_episodes })}
                        </div>
                      </div>
                      <p className="mt-2 truncate font-terminal text-sm text-foreground group-hover:text-[#a855f7]">
                        {item.show.name}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {item.show.publisher}
                      </p>
                    </motion.a>
                  ))}
                </div>
              </TerminalCard>

              {/* Pagination */}
              {showsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <TerminalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowsPage((p) => Math.max(0, p - 1))}
                    disabled={showsPage === 0}
                  >
                    {tCommon('prev')}
                  </TerminalButton>
                  <span className="font-mono text-sm text-muted-foreground">
                    {tCommon('page', { current: showsPage + 1, total: showsTotalPages })}
                  </span>
                  <TerminalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowsPage((p) => Math.min(showsTotalPages - 1, p + 1))}
                    disabled={showsPage >= showsTotalPages - 1}
                  >
                    {tCommon('next')}
                  </TerminalButton>
                </div>
              )}
            </>
          ) : (
            <TerminalCard>
              <div className="py-16 text-center">
                <span className="text-5xl opacity-30">🎙️</span>
                <p className="mt-4 font-terminal text-lg text-muted-foreground">{t('noShows')}</p>
                <p className="mt-2 font-mono text-sm text-muted-foreground/70">
                  Save podcasts on Spotify to see them here
                </p>
              </div>
            </TerminalCard>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="episodes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {episodesLoading ? (
            <TerminalCard>
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-20 h-20 rounded-lg bg-secondary" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-3/4 rounded bg-secondary" />
                      <div className="h-3 w-1/2 rounded bg-secondary" />
                      <div className="h-3 w-1/4 rounded bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            </TerminalCard>
          ) : episodesData?.items && episodesData.items.length > 0 ? (
            <>
              <TerminalCard>
                <div className="space-y-3">
                  {episodesData.items.map((item, index) => (
                    <motion.a
                      key={item.episode.id}
                      href={item.episode.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group flex gap-4 rounded-lg p-3 transition-colors hover:bg-[rgba(168,85,247,0.05)]"
                    >
                      {/* Episode image */}
                      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border border-[rgba(168,85,247,0.2)] transition-all group-hover:border-[#a855f7]">
                        {getLargestImage(item.episode.images) ? (
                          <Image
                            src={getLargestImage(item.episode.images)!}
                            alt={item.episode.name}
                            fill
                            quality={100}
                            sizes="80px"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <span className="text-xl opacity-30">🎙️</span>
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[#a855f7] text-2xl">▶</span>
                        </div>
                      </div>

                      {/* Episode info */}
                      <div className="flex-1 min-w-0 py-1">
                        <p className="font-terminal text-base text-foreground group-hover:text-[#a855f7] line-clamp-1">
                          {item.episode.name}
                        </p>
                        <p className="mt-1 font-mono text-sm text-muted-foreground line-clamp-1">
                          {item.episode.show.name}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(168,85,247,0.1)] px-2 py-0.5 font-mono text-xs text-[#a855f7]">
                            {formatDuration(item.episode.duration_ms)}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatReleaseDate(item.episode.release_date)}
                          </span>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </TerminalCard>

              {/* Pagination */}
              {episodesTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <TerminalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setEpisodesPage((p) => Math.max(0, p - 1))}
                    disabled={episodesPage === 0}
                  >
                    {tCommon('prev')}
                  </TerminalButton>
                  <span className="font-mono text-sm text-muted-foreground">
                    {tCommon('page', { current: episodesPage + 1, total: episodesTotalPages })}
                  </span>
                  <TerminalButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setEpisodesPage((p) => Math.min(episodesTotalPages - 1, p + 1))}
                    disabled={episodesPage >= episodesTotalPages - 1}
                  >
                    {tCommon('next')}
                  </TerminalButton>
                </div>
              )}
            </>
          ) : (
            <TerminalCard>
              <div className="py-16 text-center">
                <span className="text-5xl opacity-30">🎧</span>
                <p className="mt-4 font-terminal text-lg text-muted-foreground">{t('noEpisodes')}</p>
                <p className="mt-2 font-mono text-sm text-muted-foreground/70">
                  Save episodes on Spotify to see them here
                </p>
              </div>
            </TerminalCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
