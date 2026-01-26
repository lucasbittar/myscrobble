'use client';

import { motion } from 'framer-motion';

type StandardCardType = 'dashboard' | 'history' | 'top' | 'concerts' | 'podcasts';

interface ThemeColors {
  from: string;
  to: string;
  glow: string;
  accent: string;
}

const themeConfigs: Record<StandardCardType, ThemeColors> = {
  dashboard: {
    from: '#1DB954',
    to: '#14B8A6',
    glow: 'rgba(29, 185, 84, 0.35)',
    accent: '#10B981',
  },
  history: {
    from: '#1DB954',
    to: '#14B8A6',
    glow: 'rgba(29, 185, 84, 0.35)',
    accent: '#059669',
  },
  top: {
    from: '#8B5CF6',
    to: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.35)',
    accent: '#A855F7',
  },
  concerts: {
    from: '#EC4899',
    to: '#8B5CF6',
    glow: 'rgba(236, 72, 153, 0.35)',
    accent: '#F472B6',
  },
  podcasts: {
    from: '#14B8A6',
    to: '#8B5CF6',
    glow: 'rgba(20, 184, 166, 0.35)',
    accent: '#2DD4BF',
  },
};

interface ShareCardBackgroundProps {
  type: StandardCardType;
}

export function ShareCardBackground({ type }: ShareCardBackgroundProps) {
  const theme = themeConfigs[type];

  return (
    <div
      className="relative w-[1080px] h-[1920px] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FAFBFC 0%, #F5F5F7 50%, #EFEFEF 100%)',
      }}
    >
      {/* Subtle base gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 120% 80% at 50% -20%, ${theme.from}08 0%, transparent 60%)`,
        }}
      />

      {/* Primary blob - top right - large organic shape */}
      <motion.div
        className="absolute"
        style={{
          width: 700,
          height: 700,
          top: -100,
          right: -150,
          background: `radial-gradient(circle at 30% 40%, ${theme.from} 0%, ${theme.to}90 60%, transparent 100%)`,
          filter: 'blur(120px)',
          opacity: 0.35,
          borderRadius: '40% 60% 70% 30% / 40% 50% 50% 60%',
        }}
        animate={{
          scale: [1, 1.08, 1.02, 1.06, 1],
          rotate: [0, 8, -5, 3, 0],
          x: [0, 30, -15, 10, 0],
          y: [0, -20, 15, -10, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary blob - left side mid-height */}
      <motion.div
        className="absolute"
        style={{
          width: 550,
          height: 550,
          top: '35%',
          left: -200,
          background: `radial-gradient(circle at 60% 50%, ${theme.to} 0%, ${theme.from}80 50%, transparent 100%)`,
          filter: 'blur(100px)',
          opacity: 0.28,
          borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
        }}
        animate={{
          scale: [1, 1.05, 0.98, 1.03, 1],
          rotate: [0, -10, 5, -8, 0],
          x: [0, 25, -10, 15, 0],
          y: [0, 15, -25, 10, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Tertiary blob - bottom right accent */}
      <motion.div
        className="absolute"
        style={{
          width: 450,
          height: 450,
          bottom: '5%',
          right: -80,
          background: `radial-gradient(circle at 40% 60%, ${theme.accent} 0%, ${theme.from}70 60%, transparent 100%)`,
          filter: 'blur(90px)',
          opacity: 0.22,
          borderRadius: '50% 50% 60% 40% / 60% 40% 60% 40%',
        }}
        animate={{
          scale: [1, 1.06, 0.97, 1.04, 1],
          rotate: [0, 12, -8, 6, 0],
          x: [0, -20, 15, -10, 0],
          y: [0, -30, 10, -15, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />

      {/* Quaternary blob - bottom left subtle glow */}
      <motion.div
        className="absolute"
        style={{
          width: 380,
          height: 380,
          bottom: -100,
          left: '15%',
          background: `radial-gradient(circle at 50% 50%, ${theme.to}90 0%, ${theme.accent}50 50%, transparent 100%)`,
          filter: 'blur(80px)',
          opacity: 0.18,
          borderRadius: '70% 30% 50% 50% / 40% 60% 40% 60%',
        }}
        animate={{
          scale: [1, 0.95, 1.04, 0.98, 1],
          rotate: [0, -6, 10, -4, 0],
          x: [0, 15, -20, 8, 0],
          y: [0, 20, -10, 15, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
        }}
      />

      {/* Floating accent orb - small wandering element */}
      <motion.div
        className="absolute"
        style={{
          width: 200,
          height: 200,
          top: '55%',
          right: '30%',
          background: `radial-gradient(circle, ${theme.from}60 0%, transparent 70%)`,
          filter: 'blur(60px)',
          opacity: 0.2,
        }}
        animate={{
          x: [0, 50, -30, 40, 0],
          y: [0, -40, 30, -20, 0],
          scale: [1, 1.1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Top edge subtle gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.from}30 30%, ${theme.to}30 70%, transparent 100%)`,
        }}
      />

      {/* Corner accent - top left decorative element */}
      <motion.div
        className="absolute"
        style={{
          width: 120,
          height: 120,
          top: 60,
          left: 60,
          background: `conic-gradient(from 180deg at 50% 50%, ${theme.from}20 0deg, transparent 90deg, ${theme.to}15 180deg, transparent 270deg)`,
          filter: 'blur(30px)',
          opacity: 0.4,
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
          scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Premium noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Subtle vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.03) 100%)',
        }}
      />
    </div>
  );
}
