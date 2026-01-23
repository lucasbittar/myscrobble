'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Confetti } from '../visualizations/Confetti';
import { AuraOrb, MoodColor } from '../visualizations/AuraOrb';
import { CountUp } from '@/components/modern';

interface SlideSummaryProps {
  stats: {
    uniqueArtists: number;
    uniqueTracks: number;
    totalTracks: number;
    totalMinutes: number;
  };
  podcastCount?: number;
  moodColor?: MoodColor;
  userName?: string;
  onShare?: () => void;
  onRestart?: () => void;
}

export function SlideSummary({
  stats,
  podcastCount = 0,
  moodColor = 'experimental',
  userName,
  onShare,
  onRestart,
}: SlideSummaryProps) {
  const t = useTranslations('wrapped');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const hours = Math.floor(stats.totalMinutes / 60);
  const minutes = stats.totalMinutes % 60;

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-6" onClick={(e) => e.stopPropagation()}>
      {/* Confetti burst */}
      <Confetti trigger={showConfetti} count={80} />

      {/* Header with celebration */}
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.span
          className="text-5xl block mb-3"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          🎉
        </motion.span>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          {t('slides.summary.title')}
        </h1>
      </motion.div>

      {/* Mini aura orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="flex justify-center"
      >
        <AuraOrb moodColor={moodColor} size="sm" />
      </motion.div>

      {/* Stats grid - 2x3 even layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* Time Listened - full width */}
        {stats.totalMinutes > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
          >
            <p className="text-2xl md:text-3xl font-bold text-white">
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
            </p>
            <p className="text-white/50 text-xs uppercase tracking-wider">{t('slides.summary.timeListened')}</p>
          </motion.div>
        )}

        {/* Tracks Played */}
        {stats.totalTracks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
          >
            <p className="text-xl md:text-2xl font-bold text-white">
              <CountUp end={stats.totalTracks} duration={1} />
            </p>
            <p className="text-white/50 text-xs uppercase tracking-wider">{t('slides.summary.tracksPlayed')}</p>
          </motion.div>
        )}

        {/* Unique Artists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
        >
          <p className="text-xl md:text-2xl font-bold text-white">
            <CountUp end={stats.uniqueArtists} duration={1} />
          </p>
          <p className="text-white/50 text-xs uppercase tracking-wider">{t('slides.summary.uniqueArtists')}</p>
        </motion.div>

        {/* Unique Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
        >
          <p className="text-xl md:text-2xl font-bold text-white">
            <CountUp end={stats.uniqueTracks} duration={1} />
          </p>
          <p className="text-white/50 text-xs uppercase tracking-wider">{t('slides.summary.uniqueTracks')}</p>
        </motion.div>

        {/* Podcasts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm"
        >
          <p className="text-xl md:text-2xl font-bold text-white">
            <CountUp end={podcastCount} duration={1} />
          </p>
          <p className="text-white/50 text-xs uppercase tracking-wider">{t('slides.summary.podcasts')}</p>
        </motion.div>
      </motion.div>

      {/* Personalized sign-off */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-white/60 italic text-sm"
      >
        {userName
          ? t('slides.summary.signOff', { name: userName })
          : t('slides.summary.signOffGeneric')
        }
      </motion.p>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        {onShare && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShare}
            className="cursor-pointer px-6 py-3 bg-white text-black rounded-full font-bold text-lg hover:bg-white/90 transition-colors"
          >
            {t('slides.summary.share')}
          </motion.button>
        )}

        {onRestart && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="cursor-pointer px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
          >
            {t('slides.summary.watchAgain')}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
