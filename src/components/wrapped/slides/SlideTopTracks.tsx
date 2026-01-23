'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface Track {
  name: string;
  artist: string;
  image: string;
}

interface SlideTopTracksProps {
  tracks: Track[];
}

export function SlideTopTracks({ tracks }: SlideTopTracksProps) {
  const t = useTranslations('wrapped');

  // Display tracks 2-5 (excluding #1 which has its own slide)
  const displayTracks = tracks.slice(1, 6);

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
          {t('slides.topTracks.title')}
        </h2>
        <p className="text-white/60">
          {t('slides.topTracks.subtitle')}
        </p>
      </motion.div>

      {/* Track list with cascade animation */}
      <div className="space-y-3">
        {displayTracks.map((track, index) => (
          <motion.div
            key={track.name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2 + index * 0.15,
              duration: 0.5,
              type: 'spring',
              stiffness: 150,
            }}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
          >
            {/* Rank */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + index * 0.15, type: 'spring' }}
              className="w-8 text-center text-xl font-bold text-white/60"
            >
              {index + 2}
            </motion.span>

            {/* Album art */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.15 }}
              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
            >
              {track.image ? (
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">🎵</span>
                </div>
              )}
            </motion.div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {track.name}
              </p>
              <p className="text-white/50 text-sm truncate">
                {track.artist}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
