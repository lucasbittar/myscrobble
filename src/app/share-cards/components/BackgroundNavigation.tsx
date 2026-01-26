'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export type CardType =
  | 'dashboard'
  | 'history'
  | 'top'
  | 'concerts'
  | 'podcasts'
  | 'aura-energetic'
  | 'aura-chill'
  | 'aura-melancholic'
  | 'aura-nostalgic'
  | 'aura-experimental';

interface CardInfo {
  type: CardType;
  label: string;
  filename: string;
  colors: { from: string; to: string };
  isAura: boolean;
}

export const cardConfigs: CardInfo[] = [
  {
    type: 'dashboard',
    label: 'Dashboard',
    filename: 'bg-share-card-dashboard.png',
    colors: { from: '#1DB954', to: '#14B8A6' },
    isAura: false,
  },
  {
    type: 'history',
    label: 'History',
    filename: 'bg-share-card-history.png',
    colors: { from: '#1DB954', to: '#14B8A6' },
    isAura: false,
  },
  {
    type: 'top',
    label: 'Top Charts',
    filename: 'bg-share-card-top.png',
    colors: { from: '#8B5CF6', to: '#EC4899' },
    isAura: false,
  },
  {
    type: 'concerts',
    label: 'Concerts',
    filename: 'bg-share-card-concerts.png',
    colors: { from: '#EC4899', to: '#8B5CF6' },
    isAura: false,
  },
  {
    type: 'podcasts',
    label: 'Podcasts',
    filename: 'bg-share-card-podcasts.png',
    colors: { from: '#14B8A6', to: '#8B5CF6' },
    isAura: false,
  },
  {
    type: 'aura-energetic',
    label: 'Aura: Energetic',
    filename: 'bg-share-card-aura-energetic.png',
    colors: { from: '#EC4899', to: '#F59E0B' },
    isAura: true,
  },
  {
    type: 'aura-chill',
    label: 'Aura: Chill',
    filename: 'bg-share-card-aura-chill.png',
    colors: { from: '#3B82F6', to: '#14B8A6' },
    isAura: true,
  },
  {
    type: 'aura-melancholic',
    label: 'Aura: Melancholic',
    filename: 'bg-share-card-aura-melancholic.png',
    colors: { from: '#8B5CF6', to: '#6366F1' },
    isAura: true,
  },
  {
    type: 'aura-nostalgic',
    label: 'Aura: Nostalgic',
    filename: 'bg-share-card-aura-nostalgic.png',
    colors: { from: '#F59E0B', to: '#EF4444' },
    isAura: true,
  },
  {
    type: 'aura-experimental',
    label: 'Aura: Experimental',
    filename: 'bg-share-card-aura-experimental.png',
    colors: { from: '#8B5CF6', to: '#EC4899' },
    isAura: true,
  },
];

function CopyButton({ text }: { text: string }) {
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90
                 text-white text-xs font-mono rounded-lg backdrop-blur-sm
                 opacity-0 group-hover:opacity-100 transition-all duration-200
                 border border-white/10 hover:border-white/20"
    >
      Copy filename
    </button>
  );
}

function CardPreview({ card }: { card: CardInfo }) {
  return (
    <Link href={`/share-cards?type=${card.type}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.3 }}
        className="group relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer
                   shadow-lg hover:shadow-2xl transition-shadow duration-300"
        style={{
          background: `linear-gradient(160deg, #FAFBFC 0%, #F0F1F3 100%)`,
        }}
      >
        {/* Gradient blob preview */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-30 blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${card.colors.from}, ${card.colors.to})`,
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-25 blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${card.colors.to}, ${card.colors.from})`,
          }}
        />

        {/* Aura orb preview for aura cards */}
        {card.isAura && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full blur-xl opacity-50"
              style={{
                background: `radial-gradient(circle, ${card.colors.from}, ${card.colors.to})`,
              }}
            />
          </div>
        )}

        {/* Label */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white font-semibold text-sm">{card.label}</p>
          <p className="text-white/60 text-xs font-mono mt-1">{card.filename}</p>
        </div>

        <CopyButton text={card.filename} />
      </motion.div>
    </Link>
  );
}

export function BackgroundNavigation() {
  const standardCards = cardConfigs.filter((c) => !c.isAura);
  const auraCards = cardConfigs.filter((c) => c.isAura);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Share Card Backgrounds
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Click any card to view at 1080x1920px. Use browser DevTools device mode to screenshot.
          </p>
        </motion.div>

        {/* Standard Cards Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <span
              className="w-8 h-1 rounded-full"
              style={{ background: 'linear-gradient(90deg, #1DB954, #8B5CF6)' }}
            />
            Standard Cards
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {standardCards.map((card, index) => (
              <motion.div
                key={card.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <CardPreview card={card} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sonic Aura Cards Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <span
              className="w-8 h-1 rounded-full"
              style={{ background: 'linear-gradient(90deg, #EC4899, #F59E0B)' }}
            />
            Sonic Aura Cards
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {auraCards.map((card, index) => (
              <motion.div
                key={card.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <CardPreview card={card} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">How to capture backgrounds</h3>
          <ol className="text-slate-400 space-y-2 list-decimal list-inside">
            <li>Click a card to open the full background view</li>
            <li>Open browser DevTools (F12 or Cmd+Option+I)</li>
            <li>Toggle device mode (Cmd+Shift+M or Ctrl+Shift+M)</li>
            <li>Set dimensions to 1080 x 1920</li>
            <li>Take a screenshot (three dots menu → Capture screenshot)</li>
            <li>Save to <code className="text-white/80 bg-white/10 px-2 py-0.5 rounded">public/share-images/</code></li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
