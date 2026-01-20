'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlowText, TerminalCard, TerminalButton } from '@/components/crt';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslations } from 'next-intl';

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
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false,
  });

  // Tour status for badges
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-terminal text-3xl">
            <GlowText color="cyan" size="sm">
              <span className="text-[#888888]">✦</span> {t('title')}
            </GlowText>
          </h1>
          <p className="mt-1 font-mono text-sm text-[#888888]">
            {t('subtitle')}
          </p>
        </div>
        <TerminalButton
          variant="secondary"
          size="sm"
          onClick={handleRegenerate}
          loading={isGenerating}
          disabled={isLoading}
        >
          {t('regenerate')}
        </TerminalButton>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-4 text-4xl"
          >
            ✦
          </motion.div>
          <p className="font-terminal text-[#00f5ff]">
            {t('analyzing')}
          </p>
          <p className="mt-2 font-mono text-xs text-[#555555]">
            {tCommon('loading_hint')}
          </p>
        </motion.div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <TerminalCard>
          <div className="py-8 text-center">
            <p className="mb-4 font-terminal text-[#ff4444]">
              {t('failed')}
            </p>
            <p className="mb-4 font-mono text-xs text-[#888888]">
              {t('apiHint')}
            </p>
            <TerminalButton variant="secondary" size="sm" onClick={handleRegenerate}>
              {tCommon('tryAgain')}
            </TerminalButton>
          </div>
        </TerminalCard>
      )}

      {/* Recommendations */}
      {data && !isLoading && (
        <>
          {/* Based on */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.05)] p-4"
          >
            <p className="font-mono text-xs text-[#888888]">
              <span className="text-[#00f5ff]">{t('basedOn')}</span>{' '}
              {data.basedOn.join(', ')}
            </p>
          </motion.div>

          {/* Recommendations Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recommendations.map((rec: Recommendation, index: number) => (
              <motion.div
                key={rec.artist}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <TerminalCard className="h-full">
                  <div className="space-y-3">
                    {/* Artist Header */}
                    <div className="flex items-start gap-3">
                      {rec.imageUrl ? (
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[rgba(0,255,65,0.2)]">
                          <Image
                            src={rec.imageUrl}
                            alt={rec.artist}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(0,255,65,0.2)] bg-[#1a1a1a]">
                          <span className="text-2xl opacity-50">🎵</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-terminal text-lg text-[#00ff41]">
                            {rec.artist}
                          </h3>
                          {tourStatus?.[rec.artist]?.onTour && (
                            <OnTourBadge variant="badge" />
                          )}
                        </div>
                        {rec.genres.length > 0 && (
                          <p className="mt-1 truncate font-mono text-xs text-[#555555]">
                            {rec.genres.slice(0, 2).join(' • ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="font-mono text-sm text-[#888888]">{rec.reason}</p>

                    {/* Starter Songs */}
                    {rec.starterSongs.length > 0 && (
                      <div>
                        <p className="mb-1 font-terminal text-xs text-[#00f5ff]">
                          {t('startWith')}
                        </p>
                        <ul className="space-y-0.5">
                          {rec.starterSongs.map((song: string, i: number) => (
                            <li key={i} className="font-mono text-xs text-[#e0e0e0]">
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
                        className="inline-block font-terminal text-xs text-[#00f5ff] hover:text-[#00ff41]"
                      >
                        {tCommon('openInSpotify')}
                      </a>
                    )}
                  </div>
                </TerminalCard>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
