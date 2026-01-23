'use client';

import { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getLargestImage, type SpotifyShow, type SpotifyEpisode } from '@/lib/spotify';
import { PageHeader } from '@/components/modern';
import {
  ShareProvider,
  ShareModal,
  FloatingShareButton,
  type PodcastsShareData,
  type ShareData,
} from '@/components/share';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PodcastsPage() {
  const t = useTranslations('podcasts');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: showsData, isLoading: showsLoading } = useQuery({
    queryKey: ['saved-shows-all'],
    queryFn: () => fetchSavedShows(50, 0),
  });

  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    queryKey: ['saved-episodes-all'],
    queryFn: () => fetchSavedEpisodes(20, 0),
  });

  const featuredShow = showsData?.items?.[0];
  const remainingShows = showsData?.items?.slice(1) || [];

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [showsData]);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  const isLoading = showsLoading || episodesLoading;
  const hasShows = showsData?.items && showsData.items.length > 0;
  const hasEpisodes = episodesData?.items && episodesData.items.length > 0;

  // Prepare share data
  const shareData: ShareData | null = hasShows && featuredShow ? {
    type: 'podcasts',
    data: {
      featuredShow: {
        name: featuredShow.show.name,
        publisher: featuredShow.show.publisher,
        image: getLargestImage(featuredShow.show.images) || '',
        episodeCount: featuredShow.show.total_episodes,
      },
      totalShows: showsData?.total || 0,
      totalEpisodes: episodesData?.total || 0,
    } as PodcastsShareData,
  } : null;

  return (
    <ShareProvider userName="User">
      <>
    <div className="relative z-10 min-h-screen py-12 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          subtitle={t('subtitle')}
          title={t('title')}
          rightContent={
            <div className="flex items-center gap-4">
              {/* Share Button */}
              {shareData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FloatingShareButton
                    shareData={shareData}
                    theme="teal"
                    position="relative"
                    size="lg"
                    showLabel
                  />
                </motion.div>
              )}

              {/* Stats */}
              {hasShows && (
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-foreground">{showsData?.total || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('stats.shows')}</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-foreground">{episodesData?.total || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('stats.episodes')}</p>
                  </div>
                </div>
              )}
            </div>
          }
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-3 border-[#8B5CF6] border-t-transparent mb-4"
            />
            <p className="text-muted-foreground">{t('loading') || 'Loading podcasts...'}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasShows && !hasEpisodes && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative py-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6 opacity-80"
            >
              🎙️
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{t('noShows')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Save podcasts on Spotify to see them here
            </p>
          </motion.div>
        )}

        {/* Content */}
        {!isLoading && hasShows && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-16"
          >
            {/* Hero Section - Featured Show */}
            {featuredShow && (
              <motion.section variants={itemVariants}>
                <p className="text-xs font-medium tracking-[1.5px] text-[#8B5CF6] uppercase mb-6">
                  {t('hero.featured')}
                </p>
                <a
                  href={featuredShow.show.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative flex flex-col md:flex-row gap-8 items-start">
                    {/* Large Cover Art with Parallax Effect */}
                    <motion.div
                      className="relative w-full md:w-80 lg:w-96 aspect-square flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/20"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getLargestImage(featuredShow.show.images) ? (
                        <Image
                          src={getLargestImage(featuredShow.show.images)!}
                          alt={featuredShow.show.name}
                          fill
                          quality={100}
                          sizes="(max-width: 768px) 100vw, 384px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#EC4899]/30 flex items-center justify-center">
                          <span className="text-8xl opacity-50">🎙️</span>
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>

                    {/* Show Details - Glass Card */}
                    <div className="flex-1 md:-ml-12 md:mt-12 relative z-10">
                      <div className="p-6 md:p-8 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-2 group-hover:text-[#8B5CF6] transition-colors">
                          {featuredShow.show.name}
                        </h2>
                        <p className="text-lg text-[#8B5CF6] font-medium mb-4">
                          {featuredShow.show.publisher}
                        </p>
                        <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                          {featuredShow.show.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-4 py-2 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] font-semibold text-sm">
                            {t('episodeCount', { count: featuredShow.show.total_episodes })}
                          </span>
                          <span className="px-4 py-2 rounded-full bg-[#1DB954]/10 text-[#1DB954] font-semibold text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            {t('hero.openInSpotify')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.section>
            )}

            {/* Your Shows - Horizontal Carousel */}
            {remainingShows.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">{t('sections.yourShows')}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scroll('left')}
                      disabled={!canScrollLeft}
                      className="p-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm disabled:opacity-30 hover:bg-white/80 dark:hover:bg-white/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => scroll('right')}
                      disabled={!canScrollRight}
                      className="p-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm disabled:opacity-30 hover:bg-white/80 dark:hover:bg-white/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  ref={carouselRef}
                  onScroll={updateScrollButtons}
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {remainingShows.map((item, index) => (
                    <motion.a
                      key={item.show.id}
                      href={item.show.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex-shrink-0 snap-start"
                    >
                      <div className="w-44 md:w-48">
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-[1.03]">
                          {getLargestImage(item.show.images) ? (
                            <Image
                              src={getLargestImage(item.show.images)!}
                              alt={item.show.name}
                              fill
                              quality={100}
                              sizes="192px"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#EC4899]/30 flex items-center justify-center">
                              <span className="text-4xl opacity-50">🎙️</span>
                            </div>
                          )}
                          {/* Episode count badge */}
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                            {item.show.total_episodes} ep
                          </div>
                        </div>
                        <p className="mt-3 font-semibold text-foreground truncate group-hover:text-[#8B5CF6] transition-colors">
                          {item.show.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.show.publisher}
                        </p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Saved Episodes - Timeline Layout */}
            {hasEpisodes && (
              <motion.section variants={itemVariants}>
                <h2 className="text-2xl font-bold text-foreground mb-6">{t('sections.savedEpisodes')}</h2>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[15px] md:left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-[#8B5CF6] via-border to-transparent" />

                  <div className="space-y-4">
                    <AnimatePresence>
                      {episodesData?.items.map((item, index) => (
                        <motion.a
                          key={item.episode.id}
                          href={item.episode.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group flex items-start gap-4 md:gap-6"
                        >
                          {/* Timeline Dot */}
                          <div className="relative z-10 flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20 group-hover:scale-110 transition-transform">
                            <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>

                          {/* Episode Card */}
                          <div className="flex-1 p-4 md:p-5 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-transparent hover:border-[#8B5CF6]/30 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg transition-all">
                            <div className="flex gap-4">
                              {/* Episode Art */}
                              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                                {getLargestImage(item.episode.images) ? (
                                  <Image
                                    src={getLargestImage(item.episode.images)!}
                                    alt={item.episode.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover transition-transform group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 flex items-center justify-center">
                                    <span className="text-xl opacity-50">🎙️</span>
                                  </div>
                                )}
                              </div>

                              {/* Episode Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">
                                  {item.episode.name}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                  {item.episode.show.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="px-2.5 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium">
                                    {formatDuration(item.episode.duration_ms)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatReleaseDate(item.episode.release_date)}
                                  </span>
                                </div>
                              </div>

                              {/* Arrow on hover */}
                              <div className="hidden md:flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.section>
            )}
          </motion.div>
        )}
      </div>
    </div>

        {/* Share Modal */}
        <ShareModal />
      </>
    </ShareProvider>
  );
}
