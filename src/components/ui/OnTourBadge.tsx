'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type BadgeVariant = 'indicator' | 'compact' | 'badge';

interface OnTourBadgeProps {
  className?: string;
  variant?: BadgeVariant;
  /** Only applies to variant="badge" */
  showText?: boolean;
}

/**
 * OnTourBadge - Modern tour indicator
 *
 * Variants:
 * - `indicator`: Minimal glowing dot - perfect for small circular image overlays
 * - `compact`: Small pill badge without text - good for grid card overlays
 * - `badge`: Full badge with optional text - for inline/list views
 */
export function OnTourBadge({
  className,
  variant = 'badge',
  showText = true,
}: OnTourBadgeProps) {
  const t = useTranslations('tour');

  // Indicator variant - minimal glowing dot
  if (variant === 'indicator') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'relative flex items-center justify-center',
          className
        )}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute w-5 h-5 rounded-full bg-[#EC4899]/40"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        {/* Inner dot with border */}
        <div
          className="relative w-3 h-3 rounded-full border-2 border-white bg-[#EC4899] shadow-[0_0_8px_#EC4899]"
        >
          {/* Highlight */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/40" />
        </div>
      </motion.div>
    );
  }

  // Compact variant - small pill without text
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full',
          'bg-background/90 border border-[#EC4899]/60 shadow-soft',
          className
        )}
      >
        {/* Pulsing dot */}
        <span className="relative flex h-1.5 w-1.5">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-[#EC4899]"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.9, 0.3, 0.9]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#EC4899]" />
        </span>
        {/* Mini icon */}
        <span className="text-[8px] font-bold leading-none text-[#EC4899] tracking-tight uppercase">
          LIVE
        </span>
      </motion.div>
    );
  }

  // Badge variant - full badge with text
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full',
        'bg-[#EC4899]/10 border border-[#EC4899]/30',
        'text-[#EC4899]',
        'px-2.5 py-1 text-[10px] font-bold',
        className
      )}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"
          animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0.25, 0.75] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EC4899]" />
      </span>
      {showText && (
        <span className="uppercase tracking-widest">
          {t('onTour')}
        </span>
      )}
    </motion.div>
  );
}
