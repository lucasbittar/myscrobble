'use client';

import { motion, AnimatePresence } from 'framer-motion';

export interface GradientConfig {
  from: string;
  to: string;
  direction?: string;
}

// Slide-specific gradients
export const slideGradients: Record<string, GradientConfig> = {
  landing: { from: '#1A1A1A', to: '#2D2D2D' },
  intro: { from: '#1A1A1A', to: '#2D2D2D' },
  topArtist: { from: '#8B5CF6', to: '#EC4899' },
  topArtists: { from: '#6366F1', to: '#8B5CF6' },
  topTrack: { from: '#06B6D4', to: '#3B82F6' },
  topTracks: { from: '#3B82F6', to: '#6366F1' },
  sonicAura: { from: '#8B5CF6', to: '#EC4899' },
  genres: { from: '#EC4899', to: '#F43F5E' },
  timeListened: { from: '#F59E0B', to: '#EF4444' },
  patterns: { from: '#14B8A6', to: '#10B981' },
  summary: { from: '#1DB954', to: '#059669' },
};

// Mood-specific gradients (override for personalization)
export const moodGradientOverrides: Record<string, GradientConfig> = {
  energetic: { from: '#EC4899', to: '#F59E0B' },
  chill: { from: '#3B82F6', to: '#14B8A6' },
  melancholic: { from: '#8B5CF6', to: '#6366F1' },
  nostalgic: { from: '#F59E0B', to: '#EF4444' },
  experimental: { from: '#8B5CF6', to: '#EC4899' },
};

interface WrappedBackgroundProps {
  gradient: GradientConfig;
  children?: React.ReactNode;
}

export function WrappedBackground({ gradient, children }: WrappedBackgroundProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${gradient.from}-${gradient.to}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        }}
      >
        {/* Animated noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        {/* Floating orbs for depth */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle, ${gradient.from} 0%, transparent 70%)`,
            top: '10%',
            left: '10%',
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle, ${gradient.to} 0%, transparent 70%)`,
            bottom: '20%',
            right: '15%',
          }}
        />

        {children}
      </motion.div>
    </AnimatePresence>
  );
}
