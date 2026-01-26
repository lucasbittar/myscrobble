'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BackgroundNavigation, CardType, cardConfigs } from './components/BackgroundNavigation';
import { ShareCardBackground } from './components/ShareCardBackground';
import { AuraOrbBackground } from './components/AuraOrbBackground';
import Link from 'next/link';
import { motion } from 'framer-motion';

type AuraMood = 'energetic' | 'chill' | 'melancholic' | 'nostalgic' | 'experimental';
type StandardCardType = 'dashboard' | 'history' | 'top' | 'concerts' | 'podcasts';

function isAuraType(type: string): type is `aura-${AuraMood}` {
  return type.startsWith('aura-');
}

function isStandardType(type: string): type is StandardCardType {
  return ['dashboard', 'history', 'top', 'concerts', 'podcasts'].includes(type);
}

function getAuraMood(type: string): AuraMood {
  return type.replace('aura-', '') as AuraMood;
}

function BackButton() {
  return (
    <Link href="/share-cards">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2
                   bg-black/80 hover:bg-black/90 text-white text-sm font-medium
                   rounded-full backdrop-blur-sm border border-white/10
                   transition-colors duration-200"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </motion.button>
    </Link>
  );
}

function CardTypeLabel({ type }: { type: CardType }) {
  const config = cardConfigs.find((c) => c.type === type);
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
                 bg-black/80 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${config.colors.from}, ${config.colors.to})`,
        }}
      />
      <span className="text-white font-medium">{config.label}</span>
      <span className="text-white/50 text-sm font-mono">|</span>
      <span className="text-white/60 text-sm font-mono">{config.filename}</span>
    </motion.div>
  );
}

function ShareCardsContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as CardType | null;

  // If no type specified, show navigation
  if (!type) {
    return <BackgroundNavigation />;
  }

  // Validate the type
  const isValidType = cardConfigs.some((c) => c.type === type);
  if (!isValidType) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Invalid card type: {type}</p>
          <Link href="/share-cards" className="text-blue-400 hover:underline">
            Back to navigation
          </Link>
        </div>
      </div>
    );
  }

  // Render the appropriate background
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center overflow-hidden">
      <BackButton />
      <CardTypeLabel type={type} />

      {/* Background container - maintains exact 1080x1920 dimensions */}
      <div className="relative" style={{ width: 1080, height: 1920 }}>
        {isAuraType(type) && <AuraOrbBackground mood={getAuraMood(type)} />}
        {isStandardType(type) && <ShareCardBackground type={type} />}
      </div>
    </div>
  );
}

export default function ShareCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
      }
    >
      <ShareCardsContent />
    </Suspense>
  );
}
