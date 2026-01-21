'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface Artist {
  name: string;
  image: string;
}

interface SlideTopArtistsProps {
  artists: Artist[];
}

export function SlideTopArtists({ artists }: SlideTopArtistsProps) {
  const t = useTranslations('wrapped');

  // Display top 5 (excluding #1 which has its own slide)
  const displayArtists = artists.slice(1, 6);

  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
          {t('slides.topArtists.title')}
        </h2>
        <p className="text-white/60">
          {t('slides.topArtists.subtitle')}
        </p>
      </motion.div>

      {/* Artists grid - elegant horizontal layout */}
      <div className="flex justify-center items-end gap-3 md:gap-4 px-4">
        {displayArtists.map((artist, index) => {
          // Variable sizes - middle ones bigger
          const isCenter = index === 2;
          const isNearCenter = index === 1 || index === 3;

          const size = isCenter
            ? 'w-24 h-24 md:w-32 md:h-32'
            : isNearCenter
              ? 'w-20 h-20 md:w-28 md:h-28'
              : 'w-16 h-16 md:w-24 md:h-24';

          const delay = Math.abs(index - 2) * 0.1; // Animate from center outward

          return (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.2 + delay,
                duration: 0.5,
                type: 'spring',
                stiffness: 200,
              }}
              className="flex flex-col items-center gap-3"
            >
              {/* Artist image with ring */}
              <div className="relative group cursor-pointer">
                {/* Glow effect on hover */}
                <motion.div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-70 blur-md transition-opacity duration-300`}
                />

                {/* Rank badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + delay, type: 'spring' }}
                  className="absolute -top-1 -right-1 z-20 w-6 h-6 md:w-7 md:h-7 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  <span className="text-xs md:text-sm font-bold text-black">
                    {index + 2}
                  </span>
                </motion.div>

                {/* Image container */}
                <div className={`relative ${size} rounded-full overflow-hidden ring-2 ring-white/30 group-hover:ring-white/60 transition-all duration-300`}>
                  {artist.image ? (
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <span className="text-2xl">🎤</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + delay }}
                className={`text-white font-medium text-center max-w-[80px] md:max-w-[100px] truncate ${
                  isCenter ? 'text-sm md:text-base' : 'text-xs md:text-sm'
                }`}
              >
                {artist.name}
              </motion.p>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto w-2/3"
      />
    </div>
  );
}
