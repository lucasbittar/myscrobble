'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Session {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const navItemKeys = [
  { href: '/dashboard', key: 'home' },
  { href: '/dashboard/history', key: 'history' },
  { href: '/dashboard/top', key: 'charts' },
  { href: '/dashboard/podcasts', key: 'podcasts' },
  { href: '/dashboard/discover', key: 'discover' },
  { href: '/dashboard/wrapped', key: 'wrapped' },
  { href: '/dashboard/share', key: 'share' },
];

// Flowing organic shape for background
function FlowingShape({
  className,
  gradient,
  floatDirection = 'up',
}: {
  className?: string;
  gradient: string;
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
        opacity: { duration: 1.5 },
        scale: { duration: 1.5 },
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
          <linearGradient id={`grad-layout-${gradient}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <motion.path
          d="M40,-62.6C52.2,-54.5,62.9,-43.9,69.8,-31.1C76.7,-18.3,79.8,-3.3,77.5,10.8C75.2,24.9,67.4,38.1,56.7,48.1C46,58.1,32.4,64.9,17.8,69.1C3.2,73.3,-12.4,74.9,-26.6,70.9C-40.8,66.9,-53.6,57.3,-63.1,45C-72.6,32.7,-78.8,17.7,-79.5,2.1C-80.2,-13.5,-75.4,-29.7,-66.1,-42.3C-56.8,-54.9,-43,-64,-28.8,-70.4C-14.6,-76.8,0,-80.5,13.8,-77.4C27.6,-74.3,27.8,-70.7,40,-62.6Z"
          transform="translate(100 100)"
          fill={`url(#grad-layout-${gradient})`}
          animate={{
            d: [
              "M40,-62.6C52.2,-54.5,62.9,-43.9,69.8,-31.1C76.7,-18.3,79.8,-3.3,77.5,10.8C75.2,24.9,67.4,38.1,56.7,48.1C46,58.1,32.4,64.9,17.8,69.1C3.2,73.3,-12.4,74.9,-26.6,70.9C-40.8,66.9,-53.6,57.3,-63.1,45C-72.6,32.7,-78.8,17.7,-79.5,2.1C-80.2,-13.5,-75.4,-29.7,-66.1,-42.3C-56.8,-54.9,-43,-64,-28.8,-70.4C-14.6,-76.8,0,-80.5,13.8,-77.4C27.6,-74.3,27.8,-70.7,40,-62.6Z",
              "M44.7,-71.3C57.6,-63.8,67.3,-50.9,73.5,-36.7C79.7,-22.5,82.4,-7,80.1,7.6C77.8,22.2,70.5,35.9,60.3,46.8C50.1,57.7,37,65.8,22.6,70.8C8.2,75.8,-7.5,77.7,-21.9,74.1C-36.3,70.5,-49.4,61.4,-59.3,49.5C-69.2,37.6,-75.9,22.9,-77.8,7.3C-79.7,-8.3,-76.8,-24.8,-68.8,-38.1C-60.8,-51.4,-47.7,-61.5,-33.8,-68.3C-19.9,-75.1,-5.2,-78.6,8.9,-76.6C23,-74.6,31.8,-78.8,44.7,-71.3Z",
              "M40,-62.6C52.2,-54.5,62.9,-43.9,69.8,-31.1C76.7,-18.3,79.8,-3.3,77.5,10.8C75.2,24.9,67.4,38.1,56.7,48.1C46,58.1,32.4,64.9,17.8,69.1C3.2,73.3,-12.4,74.9,-26.6,70.9C-40.8,66.9,-53.6,57.3,-63.1,45C-72.6,32.7,-78.8,17.7,-79.5,2.1C-80.2,-13.5,-75.4,-29.7,-66.1,-42.3C-56.8,-54.9,-43,-64,-28.8,-70.4C-14.6,-76.8,0,-80.5,13.8,-77.4C27.6,-74.3,27.8,-70.7,40,-62.6Z",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.svg>
    </motion.div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('dashboard.navigation');

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = navItemKeys.map(item => ({
    ...item,
    label: t(item.key as 'home' | 'history' | 'charts' | 'podcasts' | 'discover' | 'wrapped' | 'share'),
  }));

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data?.user) {
          setSession(data);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Fixed organic shapes in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FlowingShape
          className="absolute -top-32 -right-32 w-[600px] h-[600px] opacity-30"
          gradient="purple-pink"
          floatDirection="up"
        />
        <FlowingShape
          className="absolute top-1/3 -left-48 w-[500px] h-[500px] opacity-25"
          gradient="teal-blue"
          floatDirection="right"
        />
        <FlowingShape
          className="absolute -bottom-24 right-1/4 w-[450px] h-[450px] opacity-20"
          gradient="spotify"
          floatDirection="left"
        />
      </div>

      {/* Minimal floating header - White translucent */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-white/10 backdrop-blur-xl border-border/50 shadow-sm'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-baseline gap-1">
              <span className="text-xl font-black tracking-tight text-foreground">MyScrobble</span>
              <span className="text-sm text-muted-foreground">.fm</span>
            </Link>

            {/* Desktop Navigation - Minimal pills */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
                      isActive
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-foreground"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User area */}
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('signOut')}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full screen overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background lg:hidden"
          >
            <div className="flex flex-col h-full pt-20 px-6">
              <nav className="flex-1 flex flex-col justify-center gap-2">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block text-4xl font-bold py-3 transition-colors ${
                          isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="py-8 border-t border-border">
                {session.user && (
                  <div className="flex items-center gap-4 mb-6">
                    {session.user.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{session.user.name}</p>
                      <p className="text-sm text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('signOut')} →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content - No container constraints for full-bleed sections */}
      <main className="pt-16">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">MyScrobble</span>
            <span className="text-sm text-muted-foreground">.fm</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built by{' '}
            <a
              href="https://lucasbittar.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              Lucas Bittar
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
