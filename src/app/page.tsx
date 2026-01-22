'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Footer } from '@/components/ui/Footer';

// Spotify icon component
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

// Flowing organic shape component with depth blur support
function FlowingShape({
  className,
  gradient,
  delay = 0,
  blur = 0,
  floatDirection = 'up'
}: {
  className?: string;
  gradient: string;
  delay?: number;
  blur?: number;
  floatDirection?: 'up' | 'down' | 'left' | 'right';
}) {
  const floatAnimations = {
    up: { y: [0, -30, 0], x: [0, 15, 0] },
    down: { y: [0, 30, 0], x: [0, -15, 0] },
    left: { x: [0, -30, 0], y: [0, 15, 0] },
    right: { x: [0, 30, 0], y: [0, -15, 0] },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        ...floatAnimations[floatDirection],
      }}
      transition={{
        opacity: { duration: 1.5, delay },
        scale: { duration: 1.5, delay },
        x: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
        y: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
      }}
      className={className}
      style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        animate={{
          rotate: [0, 8, -8, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <defs>
          <linearGradient id={`grad-${gradient}-${blur}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradient === 'purple-pink' && (
              <>
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </>
            )}
            {gradient === 'teal-blue' && (
              <>
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </>
            )}
            {gradient === 'spotify' && (
              <>
                <stop offset="0%" stopColor="#1DB954" />
                <stop offset="100%" stopColor="#14B8A6" />
              </>
            )}
            {gradient === 'warm' && (
              <>
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#EC4899" />
              </>
            )}
            {gradient === 'blue-cyan' && (
              <>
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#14B8A6" />
              </>
            )}
          </linearGradient>
        </defs>
        <path
          d="M40,-62.6C52.2,-54.5,62.9,-43.9,69.8,-31.1C76.7,-18.3,79.8,-3.3,77.5,10.8C75.2,24.9,67.4,38.1,56.7,48.1C46,58.1,32.4,64.9,17.8,69.1C3.2,73.3,-12.4,74.9,-26.6,70.9C-40.8,66.9,-53.6,57.3,-63.1,45C-72.6,32.7,-78.8,17.7,-79.5,2.1C-80.2,-13.5,-75.4,-29.7,-66.1,-42.3C-56.8,-54.9,-43,-64,-28.8,-70.4C-14.6,-76.8,0,-80.5,13.8,-77.4C27.6,-74.3,27.8,-70.7,40,-62.6Z"
          transform="translate(100 100)"
          fill={`url(#grad-${gradient}-${blur})`}
        />
      </motion.svg>
    </motion.div>
  );
}

// Section reveal wrapper
function RevealSection({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Highlighted text component
function Highlight({
  children,
  color = 'green'
}: {
  children: React.ReactNode;
  color?: 'green' | 'purple' | 'pink' | 'blue';
}) {
  const colors = {
    green: 'bg-[#1DB954]/20',
    purple: 'bg-[#8B5CF6]/20',
    pink: 'bg-[#EC4899]/20',
    blue: 'bg-[#3B82F6]/20',
  };

  return (
    <span className={`relative inline-block px-2 -mx-2 ${colors[color]} rounded-lg`}>
      {children}
    </span>
  );
}

// Feature item for scroll section
function FeatureItem({
  number,
  title,
  description,
  color,
  delay,
  ctaLabel,
  onCtaClick
}: {
  number: string;
  title: string;
  description: string;
  color: string;
  delay: number;
  ctaLabel: string;
  onCtaClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="flex flex-col md:flex-row items-start gap-8 py-12 group"
    >
      <span
        className="text-[100px] md:text-[180px] font-black leading-none -mt-4 md:-mt-8 transition-all duration-500 group-hover:scale-110"
        style={{ color, opacity: 0.15 }}
      >
        {number}
      </span>
      <div className="pt-0 md:pt-8 flex-1">
        <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-4 group-hover:text-[var(--accent)] transition-colors" style={{ '--accent': color } as React.CSSProperties}>
          {title}
        </h3>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed mb-6">{description}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <SpotifyIcon className="w-4 h-4" />
          <span>{ctaLabel}</span>
          <span>→</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// Animated stat icon components
function StatsIcon({ type, color }: { type: 'tracks' | 'artists' | 'history' | 'ai'; color: string }) {
  if (type === 'tracks') {
    return (
      <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
        <motion.circle
          cx="40"
          cy="40"
          r="30"
          stroke={color}
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.rect
          x="30"
          y="25"
          width="4"
          height="30"
          rx="2"
          fill={color}
          animate={{ height: [20, 30, 25, 30, 20] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.rect
          x="38"
          y="20"
          width="4"
          height="40"
          rx="2"
          fill={color}
          animate={{ height: [30, 40, 35, 25, 30] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.rect
          x="46"
          y="28"
          width="4"
          height="24"
          rx="2"
          fill={color}
          animate={{ height: [24, 18, 28, 22, 24] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </svg>
    );
  }

  if (type === 'artists') {
    return (
      <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
        <motion.circle
          cx="40"
          cy="30"
          r="12"
          fill={color}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.path
          d="M20 65c0-11 9-20 20-20s20 9 20 20"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Orbiting music notes */}
        {[0, 120, 240].map((angle, i) => {
          const startCx = 40 + 28 * Math.cos((angle * Math.PI) / 180);
          const startCy = 40 + 28 * Math.sin((angle * Math.PI) / 180);
          return (
            <motion.circle
              key={angle}
              cx={startCx}
              cy={startCy}
              r="3"
              fill={color}
              animate={{
                cx: [
                  startCx,
                  40 + 28 * Math.cos(((angle + 120) * Math.PI) / 180),
                  40 + 28 * Math.cos(((angle + 240) * Math.PI) / 180),
                  startCx,
                ],
                cy: [
                  startCy,
                  40 + 28 * Math.sin(((angle + 120) * Math.PI) / 180),
                  40 + 28 * Math.sin(((angle + 240) * Math.PI) / 180),
                  startCy,
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
            />
          );
        })}
      </svg>
    );
  }

  if (type === 'history') {
    return (
      <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
        <motion.circle
          cx="40"
          cy="40"
          r="28"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray="8 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.line
          x1="40"
          y1="40"
          x2="40"
          y2="22"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '40px 40px' }}
        />
        <motion.line
          x1="40"
          y1="40"
          x2="52"
          y2="40"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '40px 40px' }}
        />
        <circle cx="40" cy="40" r="4" fill={color} />
      </svg>
    );
  }

  if (type === 'ai') {
    return (
      <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
        <motion.path
          d="M40 15l5 10 10 2-7 7 2 10-10-5-10 5 2-10-7-7 10-2z"
          fill={color}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '40px 35px' }}
        />
        <motion.circle
          cx="25"
          cy="55"
          r="8"
          stroke={color}
          strokeWidth="2"
          fill="none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        <motion.circle
          cx="55"
          cy="55"
          r="8"
          stroke={color}
          strokeWidth="2"
          fill="none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        />
        <motion.path
          d="M25 55h30"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4 2"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    );
  }

  return null;
}

// Stat item component with cool visuals
function StatItem({
  value,
  label,
  delay,
  icon,
  color
}: {
  value: string;
  label: string;
  delay: number;
  icon: 'tracks' | 'artists' | 'history' | 'ai';
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="flex flex-col items-center group"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 mb-4 transition-transform duration-300 group-hover:scale-110">
        <StatsIcon type={icon} color={color} />
      </div>
      <p className="text-4xl md:text-6xl font-black mb-2" style={{ color }}>{value}</p>
      <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('landing');

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    router.push('/api/auth/signin/spotify');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      {/* Fixed organic shapes in background with subtle depth field */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Background - slight blur for depth */}
        <FlowingShape
          className="absolute -top-48 -right-48 w-[700px] h-[700px] opacity-25"
          gradient="purple-pink"
          delay={0}
          blur={20}
          floatDirection="up"
        />

        {/* Sharp foreground blobs */}
        <FlowingShape
          className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] opacity-25"
          gradient="warm"
          delay={0.3}
          blur={0}
          floatDirection="left"
        />
        <FlowingShape
          className="absolute top-1/2 -right-24 w-[350px] h-[350px] opacity-35"
          gradient="spotify"
          delay={0.4}
          blur={0}
          floatDirection="up"
        />
        <FlowingShape
          className="absolute top-20 left-1/3 w-[280px] h-[280px] opacity-20"
          gradient="teal-blue"
          delay={0.5}
          blur={0}
          floatDirection="down"
        />
      </div>

      {/* Header - White translucent */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-white/10 backdrop-blur-xl border-border/50 shadow-sm'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-xl md:text-2xl font-black tracking-tight text-foreground">MyScrobble</span>
            <span className="text-sm text-muted-foreground">.fm</span>
          </motion.div>
        </div>
      </header>

      {/* Hero Section - Full viewport */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base uppercase tracking-[0.3em] text-muted-foreground mb-8"
          >
            {t('hero.tagline')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(3rem,12vw,10rem)] font-black leading-[0.85] tracking-tight text-foreground mb-12"
          >
            {t('hero.titlePart1')}
            <br />
            <Highlight color="green">{t('hero.titleHighlight')}</Highlight> {t('hero.titlePart2')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSpotifyLogin}
            className="group inline-flex items-center gap-3 bg-[#1DB954] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/25 cursor-pointer"
          >
            <SpotifyIcon className="w-6 h-6" />
            <span>{t('hero.cta')}</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Staggered reveals */}
      <section className="py-32 md:py-48 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="mb-24 md:mb-40">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">{t('sections.whatYouGet')}</p>
            <h2 className="text-4xl md:text-7xl font-black text-foreground leading-tight">
              {t('sections.everythingAbout')}<br />
              <Highlight color="purple">{t('sections.listeningHabits')}</Highlight>
            </h2>
          </RevealSection>

          <div className="space-y-8 md:space-y-0">
            <FeatureItem
              number="01"
              title={t('features.stats')}
              description={t('features.statsDescription')}
              color="#1DB954"
              delay={0}
              ctaLabel={t('features.tryItNow')}
              onCtaClick={handleSpotifyLogin}
            />
            <FeatureItem
              number="02"
              title={t('features.ai')}
              description={t('features.aiDescription')}
              color="#8B5CF6"
              delay={0.1}
              ctaLabel={t('features.tryItNow')}
              onCtaClick={handleSpotifyLogin}
            />
            <FeatureItem
              number="03"
              title={t('features.concerts')}
              description={t('features.concertsDescription')}
              color="#EC4899"
              delay={0.2}
              ctaLabel={t('features.tryItNow')}
              onCtaClick={handleSpotifyLogin}
            />
            <FeatureItem
              number="04"
              title={t('features.share')}
              description={t('features.shareDescription')}
              color="#3B82F6"
              delay={0.3}
              ctaLabel={t('features.tryItNow')}
              onCtaClick={handleSpotifyLogin}
            />
          </div>
        </div>
      </section>

      {/* Stats Section with cool visuals */}
      <section className="py-32 md:py-48 px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <RevealSection className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <StatItem value="50+" label={t('stats.topTracks')} delay={0} icon="tracks" color="#1DB954" />
            <StatItem value="50+" label={t('stats.topArtists')} delay={0.1} icon="artists" color="#8B5CF6" />
            <StatItem value="∞" label={t('stats.history')} delay={0.2} icon="history" color="#EC4899" />
            <StatItem value="AI" label={t('stats.aiRecommendations')} delay={0.3} icon="ai" color="#F59E0B" />
          </RevealSection>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 md:py-48 px-6 md:px-12">
        <RevealSection className="max-w-5xl mx-auto text-center">
          <blockquote className="text-3xl md:text-6xl font-bold text-foreground leading-tight mb-8">
            &ldquo;{t('sections.quote1')} <Highlight color="pink">{t('sections.quote2')}</Highlight> {t('sections.quote3')} <Highlight color="blue">{t('sections.quote4')}</Highlight>.&rdquo;
          </blockquote>
          <p className="text-muted-foreground text-lg">{t('sections.quoteSubtitle')}</p>
        </RevealSection>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-48 px-6 md:px-12 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <RevealSection>
            <h2 className="text-4xl md:text-7xl font-black text-foreground mb-8">
              {t('sections.readyToExplore')}
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('sections.readyDescription')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSpotifyLogin}
              className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 rounded-full text-xl font-semibold hover:opacity-90 transition-all cursor-pointer"
            >
              <SpotifyIcon className="w-7 h-7" />
              <span>{t('sections.getStarted')}</span>
            </motion.button>
          </RevealSection>
        </div>
      </section>

      {/* Footer with disclaimer */}
      <Footer />
    </div>
  );
}
