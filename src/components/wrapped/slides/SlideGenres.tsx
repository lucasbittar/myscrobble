'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface SlideGenresProps {
  genres: string[];
}

// Genre-specific witty copy
function getGenreCopy(topGenre: string, t: (key: string, params?: Record<string, string>) => string): string {
  const genreLower = topGenre.toLowerCase();

  if (genreLower.includes('pop')) return t('slides.genres.popVeins');
  if (genreLower.includes('metal') || genreLower.includes('rock')) return t('slides.genres.metalHead');
  if (genreLower.includes('indie')) return t('slides.genres.indieKid');
  if (genreLower.includes('hip') || genreLower.includes('rap')) return t('slides.genres.hiphopSoul');
  if (genreLower.includes('electronic') || genreLower.includes('edm')) return t('slides.genres.electronicHeart');
  if (genreLower.includes('jazz')) return t('slides.genres.jazzConnoisseur');
  if (genreLower.includes('classical')) return t('slides.genres.classicalSoul');
  if (genreLower.includes('r&b') || genreLower.includes('soul')) return t('slides.genres.rnbVibes');

  return t('slides.genres.eclecticTaste');
}

export function SlideGenres({ genres }: SlideGenresProps) {
  const t = useTranslations('wrapped');
  const topGenre = genres[0] || '';
  const genreCopy = getGenreCopy(topGenre, t);
  const displayGenres = genres.slice(0, 5);

  // Calculate relative widths based on position (first = 100%, decreasing)
  const getWidth = (index: number) => {
    const widths = [100, 85, 70, 55, 40];
    return widths[index] || 40;
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
          {t('slides.genres.title')}
        </h2>
      </motion.div>

      {/* Genre bars - horizontal bar chart style */}
      <div className="space-y-3 px-4">
        {displayGenres.map((genre, index) => (
          <motion.div
            key={genre}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2 + index * 0.1,
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
            }}
            className="relative"
          >
            {/* Bar background */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.3 + index * 0.1,
                duration: 0.6,
                ease: 'easeOut',
              }}
              className="origin-left rounded-full overflow-hidden"
              style={{ width: `${getWidth(index)}%` }}
            >
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full px-4 py-3 flex items-center justify-between">
                {/* Rank number */}
                <div className="flex items-center gap-3">
                  <span className="text-white/40 text-sm font-bold w-5">
                    {index + 1}
                  </span>
                  <span className="text-white font-semibold capitalize text-sm md:text-base">
                    {genre}
                  </span>
                </div>

                {/* Visual indicator - dots/squares for emphasis */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 - index }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
                      className="w-2 h-2 rounded-full bg-white/60"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Top genre highlight card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mx-4"
      >
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <p className="text-sm text-white/50 uppercase tracking-wider mb-2">
            #1 Genre
          </p>
          <p className="text-2xl md:text-3xl font-black text-white capitalize mb-3">
            {topGenre}
          </p>
          <p className="text-white/70 italic">
            {genreCopy}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
