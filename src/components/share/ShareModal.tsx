'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useShare, shareColorThemes } from './ShareContext';
import { useShareImage } from './hooks/useShareImage';
import { DashboardShareCard } from './cards/DashboardShareCard';
import { HistoryShareCard } from './cards/HistoryShareCard';
import { TopChartsShareCard } from './cards/TopChartsShareCard';
import { ConcertsShareCard } from './cards/ConcertsShareCard';
import { SonicAuraShareCard } from './cards/SonicAuraShareCard';
import { PodcastsShareCard } from './cards/PodcastsShareCard';

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function ShareModal() {
  const { isModalOpen, closeModal, currentData, currentTheme } = useShare();
  const t = useTranslations('contextualShare');
  const locale = useLocale();
  const colors = shareColorThemes[currentTheme];

  const { isDownloading, downloadImage } = useShareImage(
    {
      type: currentData?.type || 'dashboard',
      data: currentData?.data || {},
      theme: currentTheme,
      locale,
    },
    {
      fileName: currentData ? `myscrobble-${currentData.type}` : 'myscrobble-share',
    }
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const renderCard = () => {
    if (!currentData) return null;

    switch (currentData.type) {
      case 'dashboard':
        return <DashboardShareCard data={currentData.data} theme={currentTheme} />;
      case 'history':
        return <HistoryShareCard data={currentData.data} theme={currentTheme} />;
      case 'top-charts':
        return <TopChartsShareCard data={currentData.data} theme={currentTheme} />;
      case 'concerts':
        return <ConcertsShareCard data={currentData.data} theme={currentTheme} />;
      case 'sonic-aura':
        return <SonicAuraShareCard data={currentData.data} theme={currentTheme} />;
      case 'podcasts':
        return <PodcastsShareCard data={currentData.data} theme={currentTheme} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-foreground">{t('title')}</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Card Preview */}
            <div className="p-6">
              <div className="flex justify-center">
                <div
                  className="relative rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    width: 360,
                    height: 640,
                  }}
                >
                  {renderCard()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-4">
              <motion.button
                onClick={downloadImage}
                disabled={isDownloading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                  boxShadow: `0 4px 20px ${colors.glow}`,
                }}
              >
                {isDownloading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                    />
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('downloadButton')}
                  </>
                )}
              </motion.button>

              <p className="text-xs text-center text-muted-foreground">
                {t('optimizedFor')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
