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

  const { isDownloading, canNativeShare, downloadImage, shareImage } = useShareImage(
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

  // Use native share on mobile, download on desktop
  const handleShare = canNativeShare ? shareImage : downloadImage;

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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleBackdropClick}
          />

          {/* Modal - compact, no scroll */}
          <motion.div
            className="relative w-full max-w-lg bg-white/90 dark:bg-black/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header - compact */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">{t('title')}</h2>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Card Preview - tighter padding, negative margin to pull scaled card up */}
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex justify-center">
                <div
                  className="origin-top"
                  style={{
                    transform: 'scale(0.65)',
                    marginBottom: '-224px', // Compensate for scaled height (640 * 0.35 = 224)
                  }}
                >
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
            </div>

            {/* Actions - compact */}
            <div className="px-4 pb-4 sm:px-6 sm:pb-5 space-y-3">
              <motion.button
                onClick={handleShare}
                disabled={isDownloading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white border-t-transparent"
                    />
                    {t('generating')}
                  </>
                ) : canNativeShare ? (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {t('shareButton')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('downloadButton')}
                  </>
                )}
              </motion.button>

              <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                {t('optimizedFor')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
