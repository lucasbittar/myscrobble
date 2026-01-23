'use client';

import { motion } from 'framer-motion';

export type MoodColor = 'energetic' | 'chill' | 'melancholic' | 'nostalgic' | 'experimental';

export const moodGradients: Record<MoodColor, { from: string; to: string; glow: string }> = {
  energetic: {
    from: '#EC4899',
    to: '#F59E0B',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  chill: {
    from: '#3B82F6',
    to: '#14B8A6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  melancholic: {
    from: '#8B5CF6',
    to: '#6366F1',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  nostalgic: {
    from: '#F59E0B',
    to: '#EF4444',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  experimental: {
    from: '#8B5CF6',
    to: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
};

interface AuraOrbProps {
  moodColor: MoodColor;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-20 h-20 md:w-24 md:h-24',
  md: 'w-32 h-32 md:w-40 md:h-40',
  lg: 'w-48 h-48 md:w-56 md:h-56',
};

export function AuraOrb({ moodColor, isLoading = false, size = 'md' }: AuraOrbProps) {
  const gradient = moodGradients[moodColor];

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        animate={{
          scale: isLoading ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isLoading ? [0.4, 0.6, 0.4] : [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: isLoading ? 1.5 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle, ${gradient.from} 0%, ${gradient.to} 100%)`,
        }}
      />

      {/* Main orb with morphing effect */}
      <motion.div
        className="absolute inset-2 rounded-full blur-lg"
        animate={{
          scale: isLoading ? [1, 1.05, 1] : [1, 1.02, 0.98, 1],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: isLoading ? 1 : 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
        style={{
          background: `conic-gradient(from 0deg, ${gradient.from}, ${gradient.to}, ${gradient.from})`,
        }}
      />

      {/* Inner core */}
      <motion.div
        className="absolute inset-6 rounded-full"
        animate={{
          scale: isLoading ? [1, 1.1, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: isLoading ? 0.8 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle at 30% 30%, white 0%, ${gradient.from}80 50%, ${gradient.to}60 100%)`,
          boxShadow: `0 0 40px ${gradient.glow}`,
        }}
      />

      {/* Loading pulse */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}
