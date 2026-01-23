'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CountUp } from '@/components/modern';

interface SlideTimeListenedProps {
  totalMinutes: number;
}

// Fun comparisons
function getComparison(minutes: number, t: (key: string, params?: Record<string, number | string>) => string): { text: string; icon: string } {
  const hours = minutes / 60;

  // Flight to Tokyo is ~13 hours
  const flightsToTokyo = Math.floor(hours / 13);
  if (flightsToTokyo >= 1) {
    return {
      text: t('slides.timeListened.flightsTo', { destination: 'Tokyo', count: flightsToTokyo }),
      icon: '✈️',
    };
  }

  // Average movie is ~2 hours
  const movies = Math.floor(hours / 2);
  if (movies >= 5) {
    return {
      text: t('slides.timeListened.watchMovies', { count: movies }),
      icon: '🎬',
    };
  }

  // Days of continuous music
  const days = Math.floor(hours / 24);
  if (days >= 1) {
    return {
      text: t('slides.timeListened.daysOfVibes', { count: days }),
      icon: '✨',
    };
  }

  // Audiobook average is ~10 hours
  const audiobooks = Math.floor(hours / 10);
  if (audiobooks >= 1) {
    return {
      text: t('slides.timeListened.listenAudiobooks', { count: audiobooks }),
      icon: '📚',
    };
  }

  return {
    text: t('slides.timeListened.hoursOfMusic', { count: Math.round(hours) }),
    icon: '🎧',
  };
}

export function SlideTimeListened({ totalMinutes }: SlideTimeListenedProps) {
  const t = useTranslations('wrapped');
  const [phase, setPhase] = useState(0);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const comparison = getComparison(totalMinutes, t);

  // Dramatic reveal sequence
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),  // Show "You spent..."
      setTimeout(() => setPhase(2), 2000), // Show counter
      setTimeout(() => setPhase(3), 3500), // Show "That's enough to..."
      setTimeout(() => setPhase(4), 4500), // Show comparison
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-8">
      {/* "You spent..." */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl text-white/80"
          >
            {t('slides.timeListened.youSpent')}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Giant counter */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl opacity-30">
              <div className="w-full h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" />
            </div>

            <div className="relative">
              <div className="text-6xl md:text-8xl font-black text-white">
                {hours > 0 && (
                  <>
                    <CountUp end={hours} duration={1.5} />
                    <span className="text-4xl md:text-5xl text-white/60">h </span>
                  </>
                )}
                <CountUp end={mins} duration={1.5} />
                <span className="text-4xl md:text-5xl text-white/60">m</span>
              </div>
              <p className="text-white/50 mt-2 text-sm uppercase tracking-wider">
                {t('slides.timeListened.timeListening')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "That's enough to..." */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-white/60"
          >
            {t('slides.timeListened.thatsEnough')}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Comparison with icon */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring' }}
            className="space-y-3"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-5xl block"
            >
              {comparison.icon}
            </motion.span>
            <p className="text-xl md:text-2xl text-white font-medium">
              {comparison.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
