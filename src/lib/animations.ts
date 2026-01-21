// Shared animation configuration for Top Charts components
import type { Variants } from 'framer-motion';

export const ANIMATION_TIMING = {
  exit: 0.25,
  entry: 0.35,
  stagger: 0.04,
  skeletonFade: 0.2,
} as const;

// Container variants - stagger from bottom to top (reverse order)
export const containerVariants: Variants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_TIMING.stagger,
      staggerDirection: -1, // Bottom to top: last children first
      delayChildren: 0,
    },
  },
  exit: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_TIMING.stagger,
      staggerDirection: -1, // Bottom to top: last children first
      when: 'beforeChildren',
    },
  },
};

// Hero item variants - scale and fade
export const heroVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.entry,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.98,
    transition: {
      duration: ANIMATION_TIMING.exit,
      ease: [0.55, 0.06, 0.68, 0.19], // easeInQuad
    },
  },
};

// Featured item variants (2-5 slots) - slide up
export const featuredVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.entry,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: 40,
    transition: {
      duration: ANIMATION_TIMING.exit,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  },
};

// Track featured variants (slides from right with upward motion)
export const featuredTrackVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
    y: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.entry,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    y: 30,
    transition: {
      duration: ANIMATION_TIMING.exit,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  },
};

// Grid item variants - pop up with slight scale
export const gridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.entry,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: 35,
    scale: 0.95,
    transition: {
      duration: ANIMATION_TIMING.exit,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  },
};

// List item variants (for tracks list)
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.entry,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: 30,
    transition: {
      duration: ANIMATION_TIMING.exit,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  },
};

// Skeleton fade variants
export const skeletonVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: ANIMATION_TIMING.skeletonFade },
  },
  exit: {
    opacity: 0,
    transition: { duration: ANIMATION_TIMING.skeletonFade },
  },
};

// Calculate total exit animation duration for a given item count
export function calculateExitDuration(itemCount: number): number {
  return ANIMATION_TIMING.exit + (Math.min(itemCount, 20) * ANIMATION_TIMING.stagger);
}

// Calculate total entry animation duration
export function calculateEntryDuration(itemCount: number): number {
  return ANIMATION_TIMING.entry + (Math.min(itemCount, 20) * ANIMATION_TIMING.stagger);
}

// Animation phase type
export type AnimationPhase = 'idle' | 'exiting' | 'loading' | 'entering';
