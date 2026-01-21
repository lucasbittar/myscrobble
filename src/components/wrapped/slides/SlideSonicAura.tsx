'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { AuraOrb, MoodColor } from '../visualizations/AuraOrb';
import { useTypewriter } from '../hooks/useTypewriter';

interface MoodData {
  moodSentence: string;
  moodTags: string[];
  moodColor: MoodColor;
  emoji: string;
}

interface SlideSonicAuraProps {
  mood: MoodData | null;
  isLoading?: boolean;
  topGenre?: string;
}

export function SlideSonicAura({ mood, isLoading = false, topGenre }: SlideSonicAuraProps) {
  const t = useTranslations('wrapped');
  const { displayedText, isComplete } = useTypewriter(
    mood?.moodSentence || '',
    35,
    !!mood && !isLoading
  );

  const moodColor = mood?.moodColor || 'experimental';

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-2">
          {t('slides.sonicAura.subtitle')}
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-white">
          {t('slides.sonicAura.title')}
        </h2>
      </motion.div>

      {/* Aura Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex justify-center"
      >
        <AuraOrb moodColor={moodColor} isLoading={isLoading} size="lg" />
      </motion.div>

      {/* Emoji */}
      {mood?.emoji && !isLoading && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          className="text-5xl block"
        >
          {mood.emoji}
        </motion.span>
      )}

      {/* Mood sentence with typewriter */}
      <div className="min-h-[4rem]">
        {isLoading ? (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg text-white/60 italic"
          >
            {t('slides.sonicAura.analyzing')}
          </motion.p>
        ) : (
          <p className="text-xl md:text-2xl text-white leading-relaxed">
            &ldquo;{displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-6 bg-white ml-0.5 align-middle"
              />
            )}
            {isComplete && <>&rdquo;</>}
          </p>
        )}
      </div>

      {/* Mood tags */}
      {isComplete && mood?.moodTags && mood.moodTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {mood.moodTags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/15 text-white"
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Witty observation */}
      {isComplete && topGenre && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/60 text-sm"
        >
          {t('slides.sonicAura.therapist', { genre: topGenre })}
        </motion.p>
      )}
    </div>
  );
}
