'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ShareColorTheme, shareColorThemes, ShareData, useShareSafe } from './ShareContext';

interface FloatingShareButtonProps {
  shareData: ShareData;
  theme?: ShareColorTheme;
  position?: 'fixed' | 'absolute' | 'relative';
  className?: string;
  showLabel?: boolean; // Whether to show label on hover
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { height: 40, iconSize: 16, fontSize: 12, expandedWidth: 100 },
  md: { height: 48, iconSize: 20, fontSize: 14, expandedWidth: 120 },
  lg: { height: 56, iconSize: 24, fontSize: 15, expandedWidth: 140 },
};

export function FloatingShareButton({
  shareData,
  theme = 'green',
  position = 'relative',
  className = '',
  showLabel = true,
  size = 'md',
}: FloatingShareButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shareContext = useShareSafe();
  const t = useTranslations('contextualShare');

  if (!shareContext) return null;

  const { openModal } = shareContext;
  const colors = shareColorThemes[theme];
  const config = sizeConfig[size];

  const handleClick = () => openModal(shareData, theme);

  const positionClasses =
    position === 'fixed'
      ? 'fixed bottom-6 right-6 z-50'
      : position === 'absolute'
        ? 'absolute'
        : '';

  return (
    <div className={`${positionClasses} ${className}`}>
      <motion.button
        onClick={handleClick}
        className="relative cursor-pointer overflow-visible"
        style={{
          height: config.height,
          borderRadius: config.height / 2,
        }}
        initial={{ width: config.height }}
        animate={{
          width: isHovered && showLabel ? config.expandedWidth : config.height,
          y: isHovered ? -2 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        whileTap={{ scale: 0.92 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ambient glow - always visible, pulses subtly */}
        <motion.div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: config.height,
            background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
            filter: 'blur(20px)',
          }}
          animate={{
            opacity: isHovered ? 0.7 : [0.35, 0.5, 0.35],
            scale: isHovered ? 1.15 : [1, 1.05, 1],
          }}
          transition={
            isHovered
              ? { duration: 0.3 }
              : {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />

        {/* Main button body with enhanced shadow */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: config.height / 2,
            background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingLeft: showLabel ? 16 : 0,
            paddingRight: showLabel ? 16 : 0,
          }}
          animate={{
            boxShadow: isHovered
              ? `0 12px 32px -4px ${colors.glow}, 0 4px 12px -2px rgba(0,0,0,0.2)`
              : `0 6px 20px -2px ${colors.glow}, 0 2px 8px -2px rgba(0,0,0,0.15)`,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon with subtle animation */}
          <motion.svg
            width={config.iconSize}
            height={config.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
            animate={{
              rotate: isHovered ? [0, -8, 8, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
            }}
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </motion.svg>

          {/* Text - only shows on hover when showLabel is true */}
          <AnimatePresence>
            {isHovered && showLabel && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: config.fontSize,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {t('share')}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pulse ring - attention grabber when idle */}
        {!isHovered && (
          <motion.div
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: config.height / 2,
              border: `2px solid ${colors.from}`,
            }}
            animate={{
              scale: [1, 1.4, 1.4],
              opacity: [0.6, 0, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.button>
    </div>
  );
}

// Compact inline version
export function InlineShareButton({
  shareData,
  theme = 'green',
  className = '',
}: {
  shareData: ShareData;
  theme?: ShareColorTheme;
  className?: string;
}) {
  const shareContext = useShareSafe();
  const t = useTranslations('contextualShare');
  const colors = shareColorThemes[theme];

  if (!shareContext) return null;

  const { openModal } = shareContext;
  const handleClick = () => openModal(shareData, theme);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.from}15 0%, ${colors.to}15 100%)`,
        color: colors.from,
        border: `1px solid ${colors.from}30`,
        boxShadow: `0 2px 8px ${colors.from}20`,
      }}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {t('share')}
    </motion.button>
  );
}
