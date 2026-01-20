'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslations } from 'next-intl';
import { ModernCard, ModernButton, ModernBadge, Heading, ScrollReveal } from '@/components/modern';

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

  return (
    <div className="py-12 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Heading level={2}>{t('title')}</Heading>
            <p className="mt-1 text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <ModernButton
            variant="secondary"
            onClick={handleRegenerate}
            loading={isGenerating}
            disabled={isLoading}
          >
            {t('regenerate')}
          </ModernButton>
        </div>
      </ScrollReveal>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-4 text-5xl"
          >
            ✦
          </motion.div>
          <p className="text-lg font-medium text-primary">
            {t('analyzing')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {tCommon('loading_hint')}
          </p>
        </motion.div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ModernCard className="text-center py-12">
          <div className="text-5xl mb-4 opacity-50">😵</div>
          <p className="mb-2 text-lg font-medium text-destructive">
            {t('failed')}
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            {t('apiHint')}
          </p>
          <ModernButton variant="secondary" onClick={handleRegenerate}>
            {tCommon('tryAgain')}
          </ModernButton>
        </ModernCard>
      )}

      {/* Recommendations */}
      {data && !isLoading && (
        <>
          {/* Based on */}
          <ScrollReveal delay={0.1}>
            <ModernCard className="bg-primary/5 border-primary/20">
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">{t('basedOn')}</span>{' '}
                {data.basedOn.join(', ')}
              </p>
            </ModernCard>
          </ScrollReveal>

          {/* Recommendations Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recommendations.map((rec: Recommendation, index: number) => (
              <ScrollReveal key={rec.artist} delay={0.1 + index * 0.05}>
                <ModernCard hover className="h-full">
                  <div className="space-y-4">
                    {/* Artist Header */}
                    <div className="flex items-start gap-3">
                      {rec.imageUrl ? (
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={rec.imageUrl}
                            alt={rec.artist}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-secondary">
                          <span className="text-2xl opacity-50">🎵</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {rec.artist}
                          </h3>
                          {tourStatus?.[rec.artist]?.onTour && (
                            <OnTourBadge variant="badge" />
                          )}
                        </div>
                        {rec.genres.length > 0 && (
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {rec.genres.slice(0, 2).join(' • ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>

                    {/* Starter Songs */}
                    {rec.starterSongs.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-primary uppercase tracking-wider">
                          {t('startWith')}
                        </p>
                        <ul className="space-y-1">
                          {rec.starterSongs.map((song: string, i: number) => (
                            <li key={i} className="text-sm text-foreground">
                              • {song}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Spotify Link */}
                    {rec.spotifyUrl && (
                      <a
                        href={rec.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium text-primary hover:underline"
                      >
                        {tCommon('openInSpotify')} →
                      </a>
                    )}
                  </div>
                </ModernCard>
              </ScrollReveal>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
