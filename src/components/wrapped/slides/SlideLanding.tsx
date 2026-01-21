'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useTypewriter } from '../hooks/useTypewriter';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface SlideLandingProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onStart: () => void;
  previewImage?: string;
}

export function SlideLanding({
  timeRange,
  onTimeRangeChange,
  onStart,
  previewImage,
}: SlideLandingProps) {
  const t = useTranslations('wrapped');
  const { displayedText, isComplete } = useTypewriter(t('landing.ready'), 50, true);

  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: 'short_term', label: t('timeRanges.short') },
    { key: 'medium_term', label: t('timeRanges.medium') },
    { key: 'long_term', label: t('timeRanges.long') },
  ];

  return (
    <div className="w-full max-w-lg mx-auto text-center" onClick={(e) => e.stopPropagation()}>
      {/* Blurred preview background */}
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={previewImage}
            alt=""
            fill
            className="object-cover blur-3xl scale-110"
          />
        </motion.div>
      )}

      {/* Floating music notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['♪', '♫', '♬', '♩'].map((note, i) => (
          <motion.span
            key={i}
            className="absolute text-white/20 text-4xl"
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0, 0.3, 0],
              y: [-50, -200],
              x: Math.random() * 100 - 50,
            }}
            transition={{
              duration: 4,
              delay: i * 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{
              left: `${20 + i * 20}%`,
              bottom: 0,
            }}
          >
            {note}
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-white/60">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Time range selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2"
        >
          {timeRanges.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTimeRangeChange(key)}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all ${
                timeRange === key
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Teaser text with typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="min-h-[2rem]"
        >
          <p className="text-lg text-white/80 italic">
            &ldquo;{displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-white ml-0.5 align-middle"
              />
            )}
            {isComplete && <>&rdquo;</>}
          </p>
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer relative px-8 py-4 bg-white text-black rounded-full text-lg font-bold overflow-hidden"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-[#1DB954] to-[#1ed760]"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ opacity: 0.3 }}
            />
            <span className="relative">{t('landing.begin')}</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
