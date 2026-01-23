'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/ui/Footer';

// Flowing organic shape component (matching landing page)
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
          <linearGradient id={`grad-waitlist-${gradient}-${blur}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
          </linearGradient>
        </defs>
        <path
          d="M40,-62.6C52.2,-54.5,62.9,-43.9,69.8,-31.1C76.7,-18.3,79.8,-3.3,77.5,10.8C75.2,24.9,67.4,38.1,56.7,48.1C46,58.1,32.4,64.9,17.8,69.1C3.2,73.3,-12.4,74.9,-26.6,70.9C-40.8,66.9,-53.6,57.3,-63.1,45C-72.6,32.7,-78.8,17.7,-79.5,2.1C-80.2,-13.5,-75.4,-29.7,-66.1,-42.3C-56.8,-54.9,-43,-64,-28.8,-70.4C-14.6,-76.8,0,-80.5,13.8,-77.4C27.6,-74.3,27.8,-70.7,40,-62.6Z"
          transform="translate(100 100)"
          fill={`url(#grad-waitlist-${gradient}-${blur})`}
        />
      </motion.svg>
    </motion.div>
  );
}

// Highlighted text component (matching landing page style)
function Highlight({
  children,
  color = 'pink'
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
    <span className={`relative inline-block px-2 -mx-1 ${colors[color]} rounded-lg`}>
      {children}
    </span>
  );
}

// Animated ticket stub component
function TicketStub({ isSuccess }: { isSuccess: boolean }) {
  return (
    <motion.div
      initial={{ rotateY: 0, scale: 0.9 }}
      animate={{
        rotateY: isSuccess ? 10 : [0, 5, -5, 0],
        scale: 1,
      }}
      transition={{
        rotateY: { duration: 0.6 },
        scale: { duration: 0.5 },
      }}
      whileHover={{ rotateY: 15, scale: 1.02 }}
      className="relative w-72 h-40 mx-auto perspective-1000"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Main ticket body */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Perforated edge */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-around items-center border-r border-dashed border-white/20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-background" />
          ))}
        </div>

        {/* Ticket content */}
        <div className="ml-10 p-4 h-full flex flex-col justify-between">
          {/* Top section */}
          <div>
            <div className="text-xs text-white/40 uppercase tracking-widest">MyScrobble.fm</div>
            <div className="text-lg font-bold text-white mt-1">Early Access</div>
          </div>

          {/* Stamp effect */}
          <motion.div
            initial={{ opacity: 0, scale: 1.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <div className={`px-3 py-1.5 rounded border-2 text-xs font-bold uppercase tracking-wider ${
              isSuccess
                ? 'border-[#1DB954] text-[#1DB954]'
                : 'border-[#EC4899] text-[#EC4899]'
            }`}>
              {isSuccess ? 'VIP' : 'Sold Out'}
            </div>
          </motion.div>

          {/* Bottom section */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] text-white/30 uppercase">Admit</div>
              <div className="text-xl font-mono text-white/90">ONE</div>
            </div>
            {/* Barcode effect */}
            <div className="flex gap-0.5 items-end h-8">
              {[4, 2, 6, 3, 5, 2, 7, 3, 4, 6, 2, 5].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-white/40"
                  style={{ height: `${h * 3}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -inset-4 bg-gradient-to-r from-[#EC4899]/20 via-[#8B5CF6]/20 to-[#EC4899]/20 rounded-3xl blur-xl -z-10"
      />
    </motion.div>
  );
}

// Confetti component for success state
function Confetti() {
  const confettiPieces = [...Array(30)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 360,
    type: ['note', 'vinyl', 'star'][Math.floor(Math.random() * 3)],
  }));

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            y: -20,
            opacity: 1,
            rotate: piece.rotation,
          }}
          animate={{
            y: '120vh',
            opacity: [1, 1, 0],
            rotate: piece.rotation + 360,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear',
          }}
          style={{ left: `${piece.x}%` }}
          className="absolute text-xl"
        >
          {piece.type === 'note' && '♪'}
          {piece.type === 'vinyl' && '◉'}
          {piece.type === 'star' && '✦'}
        </motion.div>
      ))}
    </div>
  );
}

export default function WaitlistPage() {
  const t = useTranslations('waitlist');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Get Spotify user info from URL params (passed from dashboard redirect)
  const spotifyId = searchParams.get('spotifyId');
  const spotifyName = searchParams.get('spotifyName');
  const spotifyImage = searchParams.get('spotifyImage');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('invalidEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          spotifyId,
          spotifyName,
          spotifyImage,
          locale,
        }),
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
      // Fallback for older browsers
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
    const text = encodeURIComponent(t('twitterText'));
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${t('whatsappText')} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Flowing organic shapes (matching landing page) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FlowingShape
          className="absolute -top-16 md:-top-48 -right-16 md:-right-48 w-[180px] md:w-[700px] h-[180px] md:h-[700px] opacity-15 md:opacity-25"
          gradient="purple-pink"
          delay={0}
          blur={20}
          floatDirection="up"
        />
        <FlowingShape
          className="absolute -bottom-12 md:-bottom-32 -left-12 md:-left-32 w-[140px] md:w-[500px] h-[140px] md:h-[500px] opacity-12 md:opacity-25"
          gradient="warm"
          delay={0.2}
          blur={0}
          floatDirection="right"
        />
        <FlowingShape
          className="absolute top-1/3 -right-8 md:-right-24 w-[120px] md:w-[350px] h-[120px] md:h-[350px] opacity-15 md:opacity-30"
          gradient="spotify"
          delay={0.4}
          blur={0}
          floatDirection="left"
        />
        <FlowingShape
          className="absolute bottom-1/4 left-1/6 md:left-1/4 w-[100px] md:w-[280px] h-[100px] md:h-[280px] opacity-10 md:opacity-20"
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

      {/* Main content - full viewport height */}
      <div className="relative z-10 h-[100dvh] flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8"
        >
          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black tracking-tight text-foreground">MyScrobble</span>
            <span className="text-sm md:text-base text-muted-foreground">.fm</span>
          </Link>
        </motion.div>

        {/* Ticket */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 md:mb-10 scale-90 md:scale-100"
        >
          <TicketStub isSuccess={isSuccess} />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-6 md:mb-10 max-w-lg px-2"
        >
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-foreground mb-3 md:mb-4 leading-tight">
            {isSuccess ? (
              <>
                {t('successPart1')} <Highlight color="green">{t('successHighlight')}</Highlight>
              </>
            ) : (
              <>
                {t('headlinePart1')} <Highlight color="pink">{t('headlineHighlight')}</Highlight>
              </>
            )}
          </h1>
          <p className="text-base md:text-xl text-muted-foreground">
            {isSuccess
              ? (alreadyExists ? t('alreadyOnList') : t('successSubtext'))
              : t('subheadline')
            }
          </p>
        </motion.div>

        {/* Position indicator */}
        <AnimatePresence>
          {isSuccess && position && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-6 md:mb-8"
            >
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl px-6 md:px-8 py-3 md:py-4 border border-border/50">
                <div className="text-center">
                  <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1">{t('yourPosition')}</div>
                  <div className="text-3xl md:text-4xl font-black text-[#EC4899]">
                    {t('position', { position })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email form or success share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {!isSuccess ? (
            <>
              {/* Email form */}
              <form onSubmit={handleSubmit} className="mb-4 md:mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="flex-1 px-4 md:px-5 py-3 md:py-4 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#EC4899]/50 focus:border-[#EC4899] transition-all text-sm md:text-base"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 md:px-6 py-3 md:py-4 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer text-sm md:text-base"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      t('cta')
                    )}
                  </button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
              </form>

              {/* Explanation */}
              <p className="text-center text-xs md:text-sm text-muted-foreground">
                {t('explanation')}
              </p>

              {/* User avatar if available */}
              {spotifyImage && spotifyName && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground"
                >
                  <Image
                    src={decodeURIComponent(spotifyImage)}
                    alt={decodeURIComponent(spotifyName)}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span>{t('signingUpAs')} <strong className="text-foreground">{decodeURIComponent(spotifyName)}</strong></span>
                </motion.div>
              )}
            </>
          ) : (
            <>
              {/* Share section */}
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-border/50">
                <h3 className="text-center font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">
                  {t('shareTitle')}
                </h3>
                <p className="text-center text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                  {t('shareDescription')}
                </p>
                <div className="flex gap-3 justify-center">
                  {/* Twitter/X */}
                  <button
                    onClick={handleTwitterShare}
                    className="p-3 bg-black/10 dark:bg-black/30 hover:bg-black/20 dark:hover:bg-black/50 rounded-xl transition-colors cursor-pointer"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 rounded-xl transition-colors cursor-pointer"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>

                  {/* Copy link */}
                  <button
                    onClick={handleCopyLink}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors relative cursor-pointer"
                    aria-label="Copy link"
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
                  </button>
                </div>
                {linkCopied && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-[#1DB954] mt-3"
                  >
                    {t('linkCopied')}
                  </motion.p>
                )}
              </div>

              {/* Back to home */}
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← {t('backToHome')}
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Footer - below the fold, only visible on scroll */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
