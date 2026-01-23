'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type BadgeVariant = 'overlay' | 'inline';

interface PlayCountBadgeProps {
  count: number;
  className?: string;
  variant?: BadgeVariant;
}

/**
 * PlayCountBadge - Elegant play count indicator
 *
 * Variants:
 * - `overlay`: Glass-morphism badge for image overlays (artist cards)
 * - `inline`: Subtle pill for list items (track rows)
 */
export function PlayCountBadge({
  count,
  className,
  variant = 'overlay',
}: PlayCountBadgeProps) {
  if (count <= 0) return null;

  // Format count with appropriate suffix
  const formatCount = (n: number): string => {
    if (n >= 1000) {
      return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return n.toString();
  };

  // Overlay variant - glass badge for artist cards
  if (variant === 'overlay') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full',
          'bg-black/60 backdrop-blur-md border border-white/10',
          'shadow-lg',
          className
        )}
      >
        {/* Animated equalizer bars */}
        <span className="flex items-end gap-[2px] h-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] bg-[#1DB954] rounded-full origin-bottom"
              animate={{
                height: ['40%', '100%', '60%', '100%', '40%'],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </span>
        <span className="text-[11px] font-semibold text-white tabular-nums tracking-tight">
          {formatCount(count)}
        </span>
      </motion.div>
    );
  }

  // Inline variant - subtle pill for track rows
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'bg-[#1DB954]/10 border border-[#1DB954]/20',
        'group-hover:bg-[#1DB954]/15 group-hover:border-[#1DB954]/30',
        'transition-colors duration-200',
        className
      )}
    >
      {/* Static mini bars icon */}
      <svg
        className="w-2.5 h-2.5 text-[#1DB954]/70 group-hover:text-[#1DB954] transition-colors"
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <rect x="1" y="5" width="2" height="6" rx="0.5" />
        <rect x="5" y="2" width="2" height="9" rx="0.5" />
        <rect x="9" y="4" width="2" height="7" rx="0.5" />
      </svg>
      <span className="text-[10px] font-semibold text-[#1DB954]/70 group-hover:text-[#1DB954] tabular-nums tracking-tight transition-colors">
        {formatCount(count)}
      </span>
    </motion.div>
  );
}
