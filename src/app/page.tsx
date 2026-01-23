'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Footer } from '@/components/ui/Footer';

// Check if we're in teaser mode
const IS_TEASER_MODE = process.env.NEXT_PUBLIC_TEASER === 'true';

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
      className="flex flex-col md:flex-row items-start gap-4 md:gap-8 py-8 md:py-12 group"
    >
      <span
        className="text-[64px] md:text-[180px] font-black leading-none -mt-2 md:-mt-8 transition-all duration-500 group-hover:scale-110"
        style={{ color, opacity: 0.15 }}
      >
        {number}
      </span>
      <div className="pt-0 md:pt-8 flex-1">
        <h3 className="text-2xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 group-hover:text-[var(--accent)] transition-colors" style={{ '--accent': color } as React.CSSProperties}>
          {title}
        </h3>
        <p className="text-base md:text-xl text-muted-foreground max-w-md leading-relaxed mb-4 md:mb-6">{description}</p>
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
      <div className="w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-110">
        <StatsIcon type={icon} color={color} />
      </div>
      <p className="text-3xl md:text-6xl font-black mb-1 md:mb-2" style={{ color }}>{value}</p>
      <p className="text-xs md:text-base text-muted-foreground uppercase tracking-wider text-center">{label}</p>
    </motion.div>
  );
}

// Feature pill animated icons for teaser page
function FeaturePillIcon({ type, color }: { type: 'stats' | 'ai' | 'concerts' | 'share'; color: string }) {
  if (type === 'stats') {
    // Animated equalizer bars
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <motion.rect
          x="1" y="8" width="3" height="9" rx="1.5"
          fill={color}
          animate={{ height: [9, 5, 9], y: [8, 12, 8] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.rect
          x="5.5" y="4" width="3" height="13" rx="1.5"
          fill={color}
          animate={{ height: [13, 7, 13], y: [4, 10, 4] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        />
        <motion.rect
          x="10" y="1" width="3" height="16" rx="1.5"
          fill={color}
          animate={{ height: [16, 8, 16], y: [1, 9, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.rect
          x="14.5" y="6" width="3" height="11" rx="1.5"
          fill={color}
          animate={{ height: [11, 4, 11], y: [6, 13, 6] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.45 }}
        />
      </svg>
    );
  }

  if (type === 'ai') {
    // Animated sparkle/magic effect
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {/* Central star */}
        <motion.path
          d="M9 1L10.5 6.5L16 8L10.5 9.5L9 15L7.5 9.5L2 8L7.5 6.5L9 1Z"
          fill={color}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '9px 8px' }}
        />
        {/* Orbiting sparkles */}
        <motion.circle
          cx="3" cy="3" r="1.5"
          fill={color}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.circle
          cx="15" cy="4" r="1"
          fill={color}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle
          cx="14" cy="14" r="1.5"
          fill={color}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        />
      </svg>
    );
  }

  if (type === 'concerts') {
    // Microphone with radiating sound waves
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {/* Microphone body */}
        <rect x="7" y="2" width="4" height="8" rx="2" fill={color} />
        {/* Stand */}
        <path d="M9 10V14M6 14H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        {/* Sound waves */}
        <motion.path
          d="M4 6C4 6 3 7.5 3 9C3 10.5 4 12 4 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.3, 1, 0.3], x: [-1, 0, -1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M14 6C14 6 15 7.5 15 9C15 10.5 14 12 14 12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0.3, 1, 0.3], x: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Outer waves */}
        <motion.path
          d="M2 5C2 5 0.5 7 0.5 9C0.5 11 2 13 2 13"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
          animate={{ opacity: [0.2, 0.6, 0.2], x: [-1, 0, -1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.path
          d="M16 5C16 5 17.5 7 17.5 9C17.5 11 16 13 16 13"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
          animate={{ opacity: [0.2, 0.6, 0.2], x: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
      </svg>
    );
  }

  if (type === 'share') {
    // Animated share card with floating elements
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {/* Card background */}
        <rect x="2" y="3" width="14" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
        {/* Image placeholder area */}
        <motion.rect
          x="4" y="5" width="6" height="4" rx="1"
          fill={color}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Text lines */}
        <motion.rect
          x="4" y="11" width="10" height="1.5" rx="0.75"
          fill={color}
          opacity={0.6}
          animate={{ width: [10, 8, 10] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Floating share indicator */}
        <motion.g
          animate={{ y: [-1, 1, -1], rotate: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '14px 7px' }}
        >
          <circle cx="14" cy="7" r="3" fill={color} />
          <path d="M13 7L14.5 5.5M14.5 5.5L16 7M14.5 5.5V8.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      </svg>
    );
  }

  return null;
}

// Teaser Page Component - Light theme with organic blobs
function TeaserPage() {
  const t = useTranslations('teaser');
  const tWaitlist = useTranslations('waitlist');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(tWaitlist('invalidEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setPosition(data.position);
        setAlreadyExists(data.alreadyExists);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://myscrobble.fm';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(tWaitlist('twitterText'));
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${tWaitlist('whatsappText')} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Confetti for success state
  const Confetti = () => {
    const pieces = [...Array(40)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
      symbol: ['♪', '♫', '◉', '✦', '★'][Math.floor(Math.random() * 5)],
      color: ['#EC4899', '#8B5CF6', '#1DB954', '#F59E0B'][Math.floor(Math.random() * 4)],
    }));

    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ y: -20, opacity: 1, rotate: piece.rotation }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: piece.rotation + 360 }}
            transition={{ duration: piece.duration, delay: piece.delay, ease: 'linear' }}
            style={{ left: `${piece.x}%`, color: piece.color }}
            className="absolute text-2xl"
          >
            {piece.symbol}
          </motion.div>
        ))}
      </div>
    );
  };

  // Sound wave animation bars
  const SoundWave = ({ className }: { className?: string }) => (
    <div className={`flex items-end gap-1 h-8 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-[#EC4899] to-[#8B5CF6] rounded-full"
          animate={{ height: [12, 28, 16, 32, 12] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Organic flowing shapes - matching main landing page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FlowingShape
          className="absolute -top-16 md:-top-48 -right-16 md:-right-48 w-[180px] md:w-[700px] h-[180px] md:h-[700px] opacity-15 md:opacity-30"
          gradient="purple-pink"
          delay={0}
          blur={20}
          floatDirection="up"
        />
        <FlowingShape
          className="absolute -bottom-12 md:-bottom-32 -left-12 md:-left-32 w-[150px] md:w-[500px] h-[150px] md:h-[500px] opacity-12 md:opacity-25"
          gradient="warm"
          delay={0.2}
          blur={0}
          floatDirection="right"
        />
        <FlowingShape
          className="absolute top-1/3 -right-8 md:-right-24 w-[120px] md:w-[400px] h-[120px] md:h-[400px] opacity-18 md:opacity-35"
          gradient="spotify"
          delay={0.4}
          blur={0}
          floatDirection="left"
        />
        <FlowingShape
          className="absolute bottom-1/4 left-1/6 md:left-1/4 w-[100px] md:w-[300px] h-[100px] md:h-[300px] opacity-10 md:opacity-20"
          gradient="teal-blue"
          delay={0.3}
          blur={0}
          floatDirection="down"
        />
      </div>

      {/* Success confetti */}
      <AnimatePresence>
        {isSuccess && <Confetti />}
      </AnimatePresence>

      {/* Main content - full viewport height, footer below fold */}
      <div className="relative z-10 h-[100dvh] flex flex-col">
        {/* Header */}
        <header className="py-4 md:py-6 px-4 md:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between max-w-7xl mx-auto"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-2xl font-black tracking-tight text-foreground">MyScrobble</span>
              <span className="text-xs md:text-sm text-muted-foreground">.fm</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full border border-border/50">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#EC4899]"
              />
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">{t('comingSoon')}</span>
            </div>
          </motion.div>
        </header>

        {/* Hero section */}
        <main className="flex-1 flex items-center justify-center px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tagline with sound waves */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-10"
            >
              <SoundWave className="hidden sm:flex" />
              <span className="text-xs md:text-base uppercase tracking-[1.5px] md:tracking-[0.3em] text-muted-foreground">
                {t('tagline')}
              </span>
              <SoundWave className="hidden sm:flex" />
            </motion.div>

            {/* Headline - all at once to prevent jumping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-6 md:mb-10"
            >
              <h1 className="text-[clamp(2.5rem,11vw,9rem)] font-black leading-[0.9] tracking-tight">
                <span className="text-foreground block">{t('headline1')}</span>
                <span className="bg-gradient-to-r from-[#EC4899] via-[#8B5CF6] to-[#1DB954] bg-clip-text text-transparent block">
                  {t('headline2')}
                </span>
                <span className="text-foreground block">{t('headline3')}</span>
              </h1>
            </motion.div>

            {/* Description - hide on success */}
            {!isSuccess && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed px-2 md:px-0"
              >
                {t('description')}
              </motion.p>
            )}

            {/* Feature pills - hide on success to save space */}
            {!isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12"
              >
                {[
                  { key: 'stats', color: '#1DB954' },
                  { key: 'ai', color: '#8B5CF6' },
                  { key: 'concerts', color: '#EC4899' },
                  { key: 'share', color: '#F59E0B' },
                ].map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full border border-border/50 hover:border-border transition-colors"
                  >
                    <FeaturePillIcon type={feature.key as 'stats' | 'ai' | 'concerts' | 'share'} color={feature.color} />
                    <span className="text-xs md:text-sm font-medium text-foreground/80">{t(`features.${feature.key}`)}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Email signup or success state */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-md mx-auto"
            >
              {!isSuccess ? (
                <>
                  <form onSubmit={handleSubmit} className="mb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        className="flex-1 px-5 py-4 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EC4899]/50 focus:border-[#EC4899] transition-all"
                        disabled={isSubmitting}
                      />
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-4 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#EC4899]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                          />
                        ) : (
                          t('getEarlyAccess')
                        )}
                      </motion.button>
                    </div>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 text-sm text-red-500"
                      >
                        {error}
                      </motion.p>
                    )}
                  </form>
                  <p className="text-sm text-muted-foreground">
                    {t('joinWaitlist')} · 🔒
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Success message */}
                  <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#1DB954] to-[#14B8A6] flex items-center justify-center"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{t('successTitle')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {alreadyExists ? t('alreadyJoined') : t('successMessage')}
                    </p>
                    {position && (
                      <div className="inline-block px-4 py-2 bg-[#EC4899]/10 rounded-full">
                        <span className="text-[#EC4899] font-bold">{t('position', { position })}</span>
                      </div>
                    )}
                  </div>

                  {/* Social share */}
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-border/30">
                    <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">{t('social.title')}</h4>
                    <div className="flex justify-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTwitterShare}
                        className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleWhatsAppShare}
                        className="p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyLink}
                        className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors cursor-pointer relative"
                      >
                        {linkCopied ? (
                          <svg className="w-5 h-5 text-[#1DB954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                    {linkCopied && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-[#1DB954] mt-3"
                      >
                        {tWaitlist('linkCopied')}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>

      </div>

      {/* Footer - below the fold, only visible on scroll */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('landing');

  // If in teaser mode, show teaser page immediately
  if (IS_TEASER_MODE) {
    return <TeaserPage />;
  }

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
          className="absolute -top-16 md:-top-48 -right-16 md:-right-48 w-[200px] md:w-[700px] h-[200px] md:h-[700px] opacity-15 md:opacity-25"
          gradient="purple-pink"
          delay={0}
          blur={20}
          floatDirection="up"
        />

        {/* Sharp foreground blobs */}
        <FlowingShape
          className="absolute -bottom-12 md:-bottom-32 right-1/4 w-[140px] md:w-[450px] h-[140px] md:h-[450px] opacity-15 md:opacity-25"
          gradient="warm"
          delay={0.3}
          blur={0}
          floatDirection="left"
        />
        <FlowingShape
          className="absolute top-1/2 -right-8 md:-right-24 w-[120px] md:w-[350px] h-[120px] md:h-[350px] opacity-20 md:opacity-35"
          gradient="spotify"
          delay={0.4}
          blur={0}
          floatDirection="up"
        />
        <FlowingShape
          className="absolute top-20 left-1/4 md:left-1/3 w-[100px] md:w-[280px] h-[100px] md:h-[280px] opacity-12 md:opacity-20"
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
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-4">
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
      <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-12 pt-20 md:pt-0 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs md:text-base uppercase tracking-[1.5px] md:tracking-[0.3em] text-muted-foreground mb-6 md:mb-8"
          >
            {t('hero.tagline')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(2.5rem,10vw,10rem)] font-black leading-[0.9] tracking-tight text-foreground mb-8 md:mb-12"
          >
            {t('hero.titlePart1')}
            <br />
            <Highlight color="green">{t('hero.titleHighlight')}</Highlight> {t('hero.titlePart2')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-base md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed px-2 md:px-0"
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
      <section className="py-16 md:py-48 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="mb-12 md:mb-40">
            <p className="text-xs md:text-sm uppercase tracking-[1.5px] md:tracking-[0.3em] text-muted-foreground mb-3 md:mb-4">{t('sections.whatYouGet')}</p>
            <h2 className="text-3xl md:text-7xl font-black text-foreground leading-tight">
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
      <section className="py-16 md:py-48 px-4 md:px-12 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <RevealSection className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">
            <StatItem value="50+" label={t('stats.topTracks')} delay={0} icon="tracks" color="#1DB954" />
            <StatItem value="50+" label={t('stats.topArtists')} delay={0.1} icon="artists" color="#8B5CF6" />
            <StatItem value="∞" label={t('stats.history')} delay={0.2} icon="history" color="#EC4899" />
            <StatItem value="AI" label={t('stats.aiRecommendations')} delay={0.3} icon="ai" color="#F59E0B" />
          </RevealSection>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 md:py-48 px-4 md:px-12">
        <RevealSection className="max-w-5xl mx-auto text-center">
          <blockquote className="text-2xl md:text-6xl font-bold text-foreground leading-tight mb-6 md:mb-8">
            &ldquo;{t('sections.quote1')} <Highlight color="pink">{t('sections.quote2')}</Highlight> {t('sections.quote3')} <Highlight color="blue">{t('sections.quote4')}</Highlight>.&rdquo;
          </blockquote>
          <p className="text-muted-foreground text-base md:text-lg">{t('sections.quoteSubtitle')}</p>
        </RevealSection>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-48 px-4 md:px-12 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <RevealSection>
            <h2 className="text-3xl md:text-7xl font-black text-foreground mb-6 md:mb-8">
              {t('sections.readyToExplore')}
            </h2>
            <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
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
