'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Mood color type
type MoodColor = 'energetic' | 'chill' | 'melancholic' | 'nostalgic' | 'experimental';

interface MoodData {
  moodSentence: string;
  moodTags: string[];
  moodColor: MoodColor;
  suggestions: string[];
  emoji: string;
  cached: boolean;
  generatedAt: string;
}

// Color gradients for different moods
const moodGradients: Record<MoodColor, { from: string; to: string; glow: string }> = {
  energetic: {
    from: '#EC4899',
    to: '#F59E0B',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  chill: {
    from: '#3B82F6',
    to: '#14B8A6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  melancholic: {
    from: '#8B5CF6',
    to: '#6366F1',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  nostalgic: {
    from: '#F59E0B',
    to: '#EF4444',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  experimental: {
    from: '#8B5CF6',
    to: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
};

async function fetchMoodAnalysis(refresh = false): Promise<MoodData> {
  const url = refresh ? '/api/ai/mood?refresh=true' : '/api/ai/mood';
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch mood analysis');
  }
  return res.json();
}

// Typewriter effect hook
function useTypewriter(text: string, speed = 40, trigger = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!trigger || !text) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, trigger]);

  return { displayedText, isComplete };
}

// Aura Orb component with morphing animation
function AuraOrb({ moodColor, isLoading }: { moodColor: MoodColor; isLoading: boolean }) {
  const gradient = moodGradients[moodColor];

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        animate={{
          scale: isLoading ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isLoading ? [0.4, 0.6, 0.4] : [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: isLoading ? 1.5 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle, ${gradient.from} 0%, ${gradient.to} 100%)`,
        }}
      />

      {/* Main orb with morphing effect */}
      <motion.div
        className="absolute inset-2 rounded-full blur-lg"
        animate={{
          scale: isLoading ? [1, 1.05, 1] : [1, 1.02, 0.98, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: isLoading ? 1 : 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
        style={{
          background: `conic-gradient(from 0deg, ${gradient.from}, ${gradient.to}, ${gradient.from})`,
        }}
      />

      {/* Inner core */}
      <motion.div
        className="absolute inset-6 rounded-full"
        animate={{
          scale: isLoading ? [1, 1.1, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: isLoading ? 0.8 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle at 30% 30%, white 0%, ${gradient.from}80 50%, ${gradient.to}60 100%)`,
          boxShadow: `0 0 40px ${gradient.glow}`,
        }}
      />

      {/* Loading pulse */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}

// Mood tag pill
function MoodTag({ tag, index }: { tag: string; index: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 * index,
        duration: 0.4,
        ease: 'backOut',
      }}
      className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#8B5CF6]/15 text-[#8B5CF6] dark:bg-[#8B5CF6]/20 dark:text-[#A78BFA]"
    >
      {tag}
    </motion.span>
  );
}

// Suggestion item
function SuggestionItem({ suggestion, index }: { suggestion: string; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.2 + 0.15 * index,
        duration: 0.4,
      }}
      className="flex items-start gap-2 text-muted-foreground"
    >
      <span className="text-[#8B5CF6] mt-0.5">•</span>
      <span>{suggestion}</span>
    </motion.li>
  );
}

export function MoodAnalysis() {
  const t = useTranslations('mood');
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hasTriggered, setHasTriggered] = useState(false);

  const {
    data: mood,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mood-analysis'],
    queryFn: () => fetchMoodAnalysis(false),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    enabled: hasTriggered,
  });

  // Trigger fetch when in view
  useEffect(() => {
    if (isInView && !hasTriggered) {
      setHasTriggered(true);
    }
  }, [isInView, hasTriggered]);

  const { displayedText, isComplete } = useTypewriter(
    mood?.moodSentence || '',
    40,
    !!mood && !isFetching
  );

  const handleRefresh = () => {
    refetch();
  };

  const currentMoodColor = mood?.moodColor || 'melancholic';
  const showLoading = isLoading || isFetching;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="py-16 md:py-24 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        {/* Glass card container */}
        <div className="relative bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 overflow-hidden">
          {/* Decorative gradient blur in background */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${moodGradients[currentMoodColor].from} 0%, transparent 70%)`,
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {t('subtitle')}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-foreground">
                {t('title')}
              </h2>
            </div>
            <motion.button
              onClick={handleRefresh}
              disabled={showLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <motion.span
                animate={showLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={showLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                ↻
              </motion.span>
              {t('refresh')}
            </motion.button>
          </div>

          {/* Main content */}
          <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
            {/* Aura Orb */}
            <div className="flex justify-center md:justify-start">
              <AuraOrb moodColor={currentMoodColor} isLoading={showLoading} />
            </div>

            {/* Mood content */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {showLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-lg text-muted-foreground italic">
                      {t('loading')}
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          className="w-16 h-6 rounded-full bg-[#8B5CF6]/20"
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <p className="text-lg text-red-500">{t('error')}</p>
                    <p className="text-sm text-muted-foreground">
                      {error instanceof Error ? error.message : 'Unknown error'}
                    </p>
                  </motion.div>
                ) : mood ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Emoji */}
                    {mood.emoji && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className="text-4xl block"
                      >
                        {mood.emoji}
                      </motion.span>
                    )}

                    {/* Main mood sentence with typewriter effect */}
                    <div className="min-h-[3rem]">
                      <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                        &ldquo;{displayedText}
                        {!isComplete && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-0.5 h-6 bg-[#8B5CF6] ml-0.5 align-middle"
                          />
                        )}
                        {isComplete && '"'}
                      </p>
                    </div>

                    {/* Mood tags */}
                    {isComplete && mood.moodTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {mood.moodTags.map((tag, index) => (
                          <MoodTag key={tag} tag={tag} index={index} />
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {isComplete && mood.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="pt-4 border-t border-border/30"
                      >
                        <p className="text-sm font-medium text-foreground mb-3">
                          {t('basedOnVibe')}
                        </p>
                        <ul className="space-y-2">
                          {mood.suggestions.map((suggestion, index) => (
                            <SuggestionItem
                              key={suggestion}
                              suggestion={suggestion}
                              index={index}
                            />
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
