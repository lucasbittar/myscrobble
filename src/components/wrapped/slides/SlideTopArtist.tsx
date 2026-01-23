'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface SlideTopArtistProps {
  artist: {
    name: string;
    image: string;
    playCount?: number;
  };
}

export function SlideTopArtist({ artist }: SlideTopArtistProps) {
  const t = useTranslations('wrapped');
  const [textPhase, setTextPhase] = useState(0);

  // Emotional copy sequence
  const copySequence = [
    t('slides.topArtist.highs'),
    t('slides.topArtist.lows'),
    t('slides.topArtist.rideOrDie'),
  ];

  useEffect(() => {
    if (textPhase < copySequence.length) {
      const timer = setTimeout(() => {
        setTextPhase((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [textPhase, copySequence.length]);

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-6">
      {/* #1 Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white uppercase tracking-wider">
          {t('slides.topArtist.badge')}
        </span>
      </motion.div>

      {/* Artist image with glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative mx-auto"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl scale-110" />

        {/* Pulse ring */}
        <motion.div
          className="absolute -inset-4 rounded-full border-2 border-white/30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Image */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/30">
          {artist.image ? (
            <Image
              src={artist.image}
              alt={artist.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <span className="text-6xl">🎵</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Artist name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl md:text-6xl font-black text-white"
      >
        {artist.name}
      </motion.h1>

      {/* Emotional copy sequence */}
      <div className="min-h-[4rem] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {copySequence.slice(0, textPhase + 1).map((text, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: index === textPhase ? 1 : 0.5, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-lg md:text-xl ${
                index === textPhase ? 'text-white' : 'text-white/50'
              } ${index < textPhase ? 'hidden' : ''}`}
            >
              {text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* Play count if available */}
      {artist.playCount && textPhase >= copySequence.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <p className="text-white/60 text-sm uppercase tracking-wider mb-1">
            {t('slides.topArtist.streams')}
          </p>
          <p className="text-3xl font-bold text-white">
            {artist.playCount.toLocaleString()}
          </p>
        </motion.div>
      )}
    </div>
  );
}
