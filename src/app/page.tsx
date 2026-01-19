'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CRTWrapper, GlowText, TerminalButton, TerminalCard } from '@/components/crt';
import { useTranslations } from 'next-intl';

// Spotify icon component
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

// Terminal line animation
function TerminalLine({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="font-mono text-sm md:text-base"
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data?.user) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSpotifyLogin = () => {
    // Use custom OAuth route instead of NextAuth's signIn
    router.push('/api/auth/signin/spotify');
  };

  if (isLoading) {
    return (
      <CRTWrapper>
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-terminal text-2xl text-[#00ff41]"
          >
            {tCommon('loadingSystem')}
          </motion.div>
        </div>
      </CRTWrapper>
    );
  }

  return (
    <CRTWrapper>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Background grid effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Main content */}
        <div className="relative z-10 w-full max-w-2xl">
          {/* Logo / Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="font-terminal text-5xl md:text-7xl">
              <GlowText color="phosphor" size="lg">
                {t('title')}
              </GlowText>
            </h1>
            <p className="mt-2 font-terminal text-lg text-[#888888]">
              <span className="text-[#00f5ff]">{t('version')}</span> // {t('subtitle')}
            </p>
          </motion.div>

          {/* Terminal Card */}
          <TerminalCard title="system.init" className="mb-8">
            <div className="space-y-2">
              <TerminalLine delay={0.2}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#888888]">{t('init.loading')}</span>
              </TerminalLine>
              <TerminalLine delay={0.4}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#00f5ff]">{t('init.spotify')}</span>{' '}
                <span className="text-[#00ff41]">[OK]</span>
              </TerminalLine>
              <TerminalLine delay={0.6}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#00f5ff]">{t('init.ai')}</span>{' '}
                <span className="text-[#00ff41]">[OK]</span>
              </TerminalLine>
              <TerminalLine delay={0.8}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#00f5ff]">{t('init.concerts')}</span>{' '}
                <span className="text-[#00ff41]">[OK]</span>
              </TerminalLine>
              <TerminalLine delay={1.0}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#ff00ff]">{t('init.auth')}</span>
                <motion.span
                  className="inline-block w-2 h-4 ml-1 bg-[#ff00ff] align-middle"
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                  style={{ boxShadow: '0 0 8px #ff00ff' }}
                />
              </TerminalLine>
            </div>
          </TerminalCard>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <FeatureCard iconType="stats" label={t('features.stats')} color="phosphor" />
            <FeatureCard iconType="ai" label={t('features.ai')} color="cyan" />
            <FeatureCard iconType="concerts" label={t('features.concerts')} color="magenta" />
            <FeatureCard iconType="share" label={t('features.share')} color="amber" />
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="flex justify-center"
          >
            <TerminalButton
              onClick={handleSpotifyLogin}
              size="lg"
              glow
              icon={<SpotifyIcon className="h-5 w-5" />}
              className="w-full md:w-auto"
            >
              {t('login')}
            </TerminalButton>
          </motion.div>

          {/* Footer info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="mt-6 text-center font-mono text-xs text-[#555555]"
          >
            {t('privacy')}
          </motion.p>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="pointer-events-none absolute bottom-4 left-4 font-terminal text-xs text-[#333333]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div>{t('system.ready')}</div>
          <div>{t('system.memory')}</div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-4 right-4 font-terminal text-xs text-[#333333]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div>{t('system.build')}</div>
          <div>{t('system.node')}</div>
        </motion.div>
      </div>
    </CRTWrapper>
  );
}

// === CUSTOM FEATURE ICONS ===

// Listening Stats Icon - Animated frequency bars (equalizer)
function ListeningStatsIcon() {
  const barHeights = [0.4, 0.7, 1, 0.6, 0.8];
  return (
    <div className="relative w-8 h-8 flex items-end justify-center gap-[3px]">
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)] pointer-events-none rounded" />
      {barHeights.map((height, i) => (
        <motion.div
          key={i}
          className="w-[4px] rounded-t-sm origin-bottom"
          style={{
            background: 'linear-gradient(to top, #00ff41, rgba(0,255,65,0.6))',
            boxShadow: '0 0 8px rgba(0,255,65,0.6)',
          }}
          animate={{
            height: [`${height * 100}%`, `${height * 60}%`, `${height * 100}%`],
          }}
          transition={{
            duration: 0.8 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// AI Discover Icon - Neural spark with synaptic pulses
function AIDiscoverIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Central node */}
      <motion.div
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: 'radial-gradient(circle, #00f5ff 0%, rgba(0,245,255,0.4) 70%)',
          boxShadow: '0 0 12px rgba(0,245,255,0.8), 0 0 24px rgba(0,245,255,0.4)',
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orbiting sparks */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: '#00f5ff',
            boxShadow: '0 0 6px #00f5ff',
            transformOrigin: 'center',
          }}
          animate={{
            x: [
              Math.cos((angle * Math.PI) / 180) * 10,
              Math.cos(((angle + 30) * Math.PI) / 180) * 12,
              Math.cos((angle * Math.PI) / 180) * 10,
            ],
            y: [
              Math.sin((angle * Math.PI) / 180) * 10,
              Math.sin(((angle + 30) * Math.PI) / 180) * 12,
              Math.sin((angle * Math.PI) / 180) * 10,
            ],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 32">
        {[0, 120, 240].map((angle, i) => (
          <motion.line
            key={i}
            x1="16"
            y1="16"
            x2={16 + Math.cos((angle * Math.PI) / 180) * 12}
            y2={16 + Math.sin((angle * Math.PI) / 180) * 12}
            stroke="#00f5ff"
            strokeWidth="1"
            strokeOpacity="0.3"
            animate={{ strokeOpacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}

// Concerts Icon - Stage spotlights converging
function ConcertsIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden">
      {/* Left spotlight beam */}
      <motion.div
        className="absolute bottom-0 left-1 w-3 h-6 origin-bottom"
        style={{
          background: 'linear-gradient(to top, rgba(255,0,255,0.8), transparent)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(1px)',
        }}
        animate={{
          rotate: [-15, -10, -15],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Right spotlight beam */}
      <motion.div
        className="absolute bottom-0 right-1 w-3 h-6 origin-bottom"
        style={{
          background: 'linear-gradient(to top, rgba(255,0,255,0.8), transparent)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(1px)',
        }}
        animate={{
          rotate: [15, 10, 15],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      {/* Center glow burst */}
      <motion.div
        className="absolute bottom-1 w-4 h-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, #ff00ff 0%, rgba(255,0,255,0) 70%)',
          boxShadow: '0 0 16px rgba(255,0,255,0.8)',
        }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Stage floor line */}
      <div
        className="absolute bottom-1 left-1 right-1 h-[2px] rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #ff00ff, transparent)',
          boxShadow: '0 0 4px #ff00ff'
        }}
      />
    </div>
  );
}

// Share Icon - Broadcasting signal arcs
function ShareIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Central broadcast point */}
      <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: '#ffb000',
          boxShadow: '0 0 8px #ffb000',
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Signal arcs */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-transparent"
          style={{
            width: 12 + i * 8,
            height: 12 + i * 8,
            borderTopColor: '#ffb000',
            borderRightColor: '#ffb000',
            transform: 'rotate(-45deg)',
            boxShadow: `0 0 ${4 + i * 2}px rgba(255,176,0,0.4)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.3,
          }}
        />
      ))}
      {/* Upward arrow hint */}
      <motion.div
        className="absolute -top-0.5 w-0 h-0"
        style={{
          borderLeft: '3px solid transparent',
          borderRight: '3px solid transparent',
          borderBottom: '4px solid #ffb000',
          filter: 'drop-shadow(0 0 3px #ffb000)',
        }}
        animate={{ y: [0, -2, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Feature card icon mapping
const featureIcons = {
  stats: <ListeningStatsIcon />,
  ai: <AIDiscoverIcon />,
  concerts: <ConcertsIcon />,
  share: <ShareIcon />,
};

function FeatureCard({
  iconType,
  label,
  color,
}: {
  iconType: 'stats' | 'ai' | 'concerts' | 'share';
  label: string;
  color: 'phosphor' | 'cyan' | 'magenta' | 'amber';
}) {
  const colorClasses = {
    phosphor: 'border-[rgba(0,255,65,0.3)] hover:border-[#00ff41] hover:shadow-[0_0_10px_rgba(0,255,65,0.3)]',
    cyan: 'border-[rgba(0,245,255,0.3)] hover:border-[#00f5ff] hover:shadow-[0_0_10px_rgba(0,245,255,0.3)]',
    magenta: 'border-[rgba(255,0,255,0.3)] hover:border-[#ff00ff] hover:shadow-[0_0_10px_rgba(255,0,255,0.3)]',
    amber: 'border-[rgba(255,176,0,0.3)] hover:border-[#ffb000] hover:shadow-[0_0_10px_rgba(255,176,0,0.3)]',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border bg-[#0d0d0d] p-4 transition-all duration-300 ${colorClasses[color]}`}
    >
      {featureIcons[iconType]}
      <span className="mt-2 font-terminal text-xs text-[#888888]">{label}</span>
    </div>
  );
}
