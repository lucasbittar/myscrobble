'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useTypewriter } from '../hooks/useTypewriter';

interface SlideIntroProps {
  timeRange: string;
}

export function SlideIntro({ timeRange }: SlideIntroProps) {
  const t = useTranslations('wrapped');
  const { displayedText, isComplete } = useTypewriter(t('slides.intro.subtitle'), 40, true);

  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
      {/* Animated waveform visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center items-end gap-1 h-24"
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-white/60 rounded-full"
            animate={{
              height: [
                20 + Math.random() * 40,
                40 + Math.random() * 60,
                20 + Math.random() * 40,
              ],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.03,
            }}
          />
        ))}
      </motion.div>

      {/* Main title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-4">
          {t('slides.intro.yourJourney')}
        </p>
        <h1 className="text-6xl md:text-8xl font-black text-white">
          {timeRange}
        </h1>
      </motion.div>

      {/* Typewriter subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="min-h-[2rem]"
      >
        <p className="text-xl text-white/80">
          {displayedText}
          {!isComplete && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-5 bg-white ml-0.5 align-middle"
            />
          )}
        </p>
      </motion.div>
    </div>
  );
}
