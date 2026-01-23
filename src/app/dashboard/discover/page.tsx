'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/modern';
import { containerVariants, heroVariants, gridItemVariants } from '@/lib/animations';

interface Recommendation {
  artist: string;
  reason: string;
  starterSongs: string[];
  genres: string[];
  imageUrl?: string;
  spotifyUrl?: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  basedOn: string[];
  generatedAt: string;
  cached?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DiscoverPage() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const refreshRef = useRef(false);
  const t = useTranslations('discover');
  const tCommon = useTranslations('common');

  const { data, isLoading, error } = useQuery<RecommendationsResponse>({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const url = refreshRef.current
        ? '/api/ai/recommendations?refresh=true'
        : '/api/ai/recommendations';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const { location } = useGeolocation();
  const artistNames = data?.recommendations?.map((r) => r.artist) || [];
  const { data: tourStatus } = useTourStatusBatch(
    artistNames,
    location?.lat,
    location?.lng
  );

  const handleRegenerate = async () => {
    setIsGenerating(true);
    refreshRef.current = true;
    await queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    refreshRef.current = false;
    setIsGenerating(false);
  };

  const featuredRec = data?.recommendations?.[0];
  const remainingRecs = data?.recommendations?.slice(1) || [];

  return (
    <div className="relative z-10 min-h-screen py-8 md:py-24 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          subtitle={t('subtitle')}
          title={t('title')}
          rightContent={
            <button
              onClick={handleRegenerate}
              disabled={isLoading || isGenerating}
              className="px-5 py-2.5 rounded-full bg-[#8B5CF6] text-white font-medium hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-[#8B5CF6]/20"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                  />
                  <span>{t('analyzing')}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('regenerate')}</span>
                </>
              )}
            </button>
          }
        />

        <AnimatePresence mode="wait">
          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-3 border-[#8B5CF6] border-t-transparent mb-4"
              />
              <p className="text-lg font-medium text-[#8B5CF6]">
                {t('analyzing')}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {tCommon('loading_hint')}
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative py-20 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-6 opacity-80"
              >
                😵
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                {t('failed')}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {t('apiHint')}
              </p>
              <button
                onClick={handleRegenerate}
                className="px-5 py-2.5 rounded-full bg-[#8B5CF6] text-white font-medium hover:bg-[#7C3AED] transition-all"
              >
                {tCommon('tryAgain')}
              </button>
            </motion.div>
          )}

          {/* Content */}
          {data && !isLoading && (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-16"
            >
              {/* Based On Section */}
              <motion.section variants={itemVariants}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
                  <p className="text-xs font-medium tracking-[0.2em] text-[#8B5CF6] uppercase">
                    {t('basedOn')}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {data.basedOn.map((artist, index) => (
                    <motion.span
                      key={artist}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm text-sm font-medium text-foreground border border-white/20 hover:border-[#8B5CF6]/30 transition-colors"
                    >
                      {artist}
                    </motion.span>
                  ))}
                </div>
              </motion.section>

              {/* Hero Section - Featured Recommendation */}
              {featuredRec && (
                <motion.section variants={heroVariants}>
                  <p className="text-xs font-medium tracking-[1.5px] text-[#8B5CF6] uppercase mb-6">
                    {t('featured')}
                  </p>
                  <div className="relative flex flex-col md:flex-row gap-8 items-start">
                    {/* Large Artist Image */}
                    <motion.div
                      className="relative w-full md:w-80 lg:w-96 aspect-square flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/20"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      {featuredRec.imageUrl ? (
                        <Image
                          src={featuredRec.imageUrl}
                          alt={featuredRec.artist}
                          fill
                          quality={100}
                          sizes="(max-width: 768px) 100vw, 384px"
                          className="object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#EC4899]/30 flex items-center justify-center">
                          <span className="text-8xl opacity-50">🎵</span>
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </motion.div>

                    {/* Artist Details - Overlapping Glass Card */}
                    <div className="flex-1 md:-ml-12 md:mt-12 relative z-10">
                      <div className="p-6 md:p-8 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl md:text-4xl font-black text-foreground">
                            {featuredRec.artist}
                          </h2>
                          {tourStatus?.[featuredRec.artist]?.onTour && (
                            <OnTourBadge variant="badge" />
                          )}
                        </div>

                        {/* Genres */}
                        {featuredRec.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {featuredRec.genres.slice(0, 3).map((genre) => (
                              <span
                                key={genre}
                                className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-sm font-medium"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Reason */}
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {featuredRec.reason}
                        </p>

                        {/* Starter Songs */}
                        {featuredRec.starterSongs.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs font-medium tracking-[0.2em] text-[#8B5CF6] uppercase mb-3">
                              {t('startWith')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {featuredRec.starterSongs.map((song) => (
                                <span
                                  key={song}
                                  className="px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 text-sm text-foreground border border-white/10"
                                >
                                  {song}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Spotify Link */}
                        {featuredRec.spotifyUrl && (
                          <a
                            href={featuredRec.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DB954]/10 text-[#1DB954] font-semibold text-sm hover:bg-[#1DB954]/20 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            {tCommon('openInSpotify')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* More Discoveries Grid */}
              {remainingRecs.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t('moreDiscoveries')}</h2>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {remainingRecs.map((rec) => (
                      <motion.div
                        key={rec.artist}
                        variants={gridItemVariants}
                        className="group"
                      >
                        <div className="h-full p-5 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-transparent hover:border-[#8B5CF6]/30 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg transition-all">
                          {/* Artist Header */}
                          <div className="flex items-start gap-4 mb-4">
                            {rec.imageUrl ? (
                              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                                <Image
                                  src={rec.imageUrl}
                                  alt={rec.artist}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>
                            ) : (
                              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20">
                                <span className="text-2xl opacity-50">🎵</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-[#8B5CF6] transition-colors truncate">
                                  {rec.artist}
                                </h3>
                                {tourStatus?.[rec.artist]?.onTour && (
                                  <OnTourBadge variant="compact" />
                                )}
                              </div>
                              {rec.genres.length > 0 && (
                                <p className="mt-1 text-sm text-muted-foreground truncate">
                                  {rec.genres.slice(0, 2).join(' • ')}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Reason */}
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{rec.reason}</p>

                          {/* Starter Songs */}
                          {rec.starterSongs.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-[#8B5CF6] uppercase tracking-wider mb-2">
                                {t('startWith')}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.starterSongs.slice(0, 2).map((song) => (
                                  <span
                                    key={song}
                                    className="px-2 py-1 rounded-md bg-white/50 dark:bg-white/5 text-xs text-foreground"
                                  >
                                    {song}
                                  </span>
                                ))}
                                {rec.starterSongs.length > 2 && (
                                  <span className="px-2 py-1 text-xs text-muted-foreground">
                                    +{rec.starterSongs.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Spotify Link */}
                          {rec.spotifyUrl && (
                            <a
                              href={rec.spotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1DB954] hover:underline"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                              {tCommon('openInSpotify')}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
