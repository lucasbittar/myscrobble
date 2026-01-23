'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface SlideTopTrackProps {
  track: {
    name: string;
    artist: string;
    image: string;
  };
}

export function SlideTopTrack({ track }: SlideTopTrackProps) {
  const t = useTranslations('wrapped');
  const [showCopy, setShowCopy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCopy(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-6">
      {/* Badge */}
      <motion.div
        initial={{ scale: 0, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white uppercase tracking-wider">
          {t('slides.topTrack.badge')}
        </span>
      </motion.div>

      {/* Album art with vinyl effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative mx-auto"
      >
        {/* Concentric pulse rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-2xl border border-white/20"
            style={{ margin: -ring * 20 }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              delay: ring * 0.3,
              repeat: Infinity,
            }}
          />
        ))}

        {/* Vinyl record effect behind album */}
        <motion.div
          className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800" />
          <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-white/10 to-transparent" />
          {/* Grooves */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/5"
              style={{
                inset: `${15 + i * 5}%`,
              }}
            />
          ))}
        </motion.div>

        {/* Album art */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl z-10">
          {track.image ? (
            <Image
              src={track.image}
              alt={track.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <span className="text-6xl">💿</span>
            </div>
          )}
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Track name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-5xl font-black text-white">
          {track.name}
        </h1>
        <p className="text-xl text-white/60">
          {track.artist}
        </p>
      </motion.div>

      {/* Emotional copy */}
      {showCopy && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg text-white/80 italic"
        >
          {t('slides.topTrack.hitDifferent')}
        </motion.p>
      )}
    </div>
  );
}
