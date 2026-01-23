'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Footer } from '@/components/ui/Footer';

// Flowing organic shape component (matching other pages)
function FlowingShape({
  className,
  gradient,
  delay = 0,
  floatDirection = 'up'
}: {
  className?: string;
  gradient: string;
  delay?: number;
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
          <linearGradient id={`grad-privacy-${gradient}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
          </linearGradient>
        </defs>
        <path
          d="M40,-62.6C52.2,-54.5,62.9,-43.9,69.8,-31.1C76.7,-18.3,79.8,-3.3,77.5,10.8C75.2,24.9,67.4,38.1,56.7,48.1C46,58.1,32.4,64.9,17.8,69.1C3.2,73.3,-12.4,74.9,-26.6,70.9C-40.8,66.9,-53.6,57.3,-63.1,45C-72.6,32.7,-78.8,17.7,-79.5,2.1C-80.2,-13.5,-75.4,-29.7,-66.1,-42.3C-56.8,-54.9,-43,-64,-28.8,-70.4C-14.6,-76.8,0,-80.5,13.8,-77.4C27.6,-74.3,27.8,-70.7,40,-62.6Z"
          transform="translate(100 100)"
          fill={`url(#grad-privacy-${gradient})`}
        />
      </motion.svg>
    </motion.div>
  );
}

// Section component for consistent styling
function Section({
  title,
  children,
  delay = 0
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mb-8"
    >
      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="w-1 h-5 bg-gradient-to-b from-[#1DB954] to-[#14B8A6] rounded-full" />
        {title}
      </h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </motion.section>
  );
}

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Flowing organic shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FlowingShape
          className="absolute -top-16 md:-top-48 -right-16 md:-right-48 w-[180px] md:w-[600px] h-[180px] md:h-[600px] opacity-10 md:opacity-20"
          gradient="purple-pink"
          delay={0}
          floatDirection="up"
        />
        <FlowingShape
          className="absolute -bottom-12 md:-bottom-32 -left-12 md:-left-32 w-[140px] md:w-[400px] h-[140px] md:h-[400px] opacity-10 md:opacity-15"
          gradient="teal-blue"
          delay={0.2}
          floatDirection="right"
        />
        <FlowingShape
          className="absolute top-1/2 -right-8 md:-right-24 w-[100px] md:w-[300px] h-[100px] md:h-[300px] opacity-10 md:opacity-15"
          gradient="spotify"
          delay={0.4}
          floatDirection="left"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">MyScrobble</span>
              <span className="text-sm text-muted-foreground">.fm</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('lastUpdated')}: {t('lastUpdatedDate')}
          </p>
        </motion.div>

        {/* Glass card container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl border border-border/50 p-6 md:p-8"
        >
          {/* Introduction */}
          <Section title={t('sections.intro.title')} delay={0.2}>
            <p>{t('sections.intro.content')}</p>
          </Section>

          {/* What We Collect */}
          <Section title={t('sections.dataCollected.title')} delay={0.25}>
            <p>{t('sections.dataCollected.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('sections.dataCollected.item1')}</li>
              <li>{t('sections.dataCollected.item2')}</li>
              <li>{t('sections.dataCollected.item3')}</li>
              <li>{t('sections.dataCollected.item4')}</li>
            </ul>
          </Section>

          {/* How We Use It */}
          <Section title={t('sections.howWeUse.title')} delay={0.3}>
            <p>{t('sections.howWeUse.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('sections.howWeUse.item1')}</li>
              <li>{t('sections.howWeUse.item2')}</li>
              <li>{t('sections.howWeUse.item3')}</li>
            </ul>
          </Section>

          {/* Data Storage */}
          <Section title={t('sections.dataStorage.title')} delay={0.35}>
            <p>{t('sections.dataStorage.content')}</p>
          </Section>

          {/* Third Party Services */}
          <Section title={t('sections.thirdParty.title')} delay={0.4}>
            <p>{t('sections.thirdParty.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Spotify:</strong> {t('sections.thirdParty.spotify')}</li>
              <li><strong>Supabase:</strong> {t('sections.thirdParty.supabase')}</li>
              <li><strong>Google Gemini:</strong> {t('sections.thirdParty.gemini')}</li>
            </ul>
          </Section>

          {/* Your Rights */}
          <Section title={t('sections.yourRights.title')} delay={0.45}>
            <p>{t('sections.yourRights.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('sections.yourRights.item1')}</li>
              <li>{t('sections.yourRights.item2')}</li>
              <li>{t('sections.yourRights.item3')}</li>
            </ul>
          </Section>

          {/* Data Retention */}
          <Section title={t('sections.retention.title')} delay={0.5}>
            <p>{t('sections.retention.content')}</p>
          </Section>

          {/* Contact */}
          <Section title={t('sections.contact.title')} delay={0.55}>
            <p>
              {t('sections.contact.content')}{' '}
              <a
                href="mailto:hello@myscrobble.fm"
                className="text-[#1DB954] hover:underline"
              >
                hello@myscrobble.fm
              </a>
            </p>
          </Section>
        </motion.div>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
