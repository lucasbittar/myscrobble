'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CRTWrapper, GlowText } from '@/components/crt';
import { useTheme } from '@/lib/theme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md border border-border hover:bg-secondary transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="font-terminal text-sm text-primary">
        {theme === 'dark' ? '☀' : '☾'}
      </span>
    </button>
  );
}

function MobileThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex w-full items-center gap-3 rounded-md px-4 py-3 font-terminal text-base text-muted-foreground hover:bg-secondary transition-colors"
    >
      <span>{theme === 'dark' ? '☀' : '☾'}</span>
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

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

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '⌂' },
  { href: '/dashboard/history', label: 'History', icon: '◎' },
  { href: '/dashboard/top', label: 'Charts', icon: '▲' },
  { href: '/dashboard/discover', label: 'Discover', icon: '✦' },
  { href: '/dashboard/wrapped', label: 'Wrapped', icon: '◆' },
  { href: '/dashboard/share', label: 'Share', icon: '◫' },
];

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
      <CRTWrapper>
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-terminal text-2xl text-primary"
          >
            LOADING...
          </motion.div>
        </div>
      </CRTWrapper>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <CRTWrapper scanlines flicker={false}>
      <div className="min-h-screen">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                  <span className="font-terminal text-sm text-primary">M</span>
                </div>
                <span className="hidden font-terminal text-lg sm:block">
                  <GlowText color="phosphor" size="sm">MyScrobble.fm</GlowText>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-4 py-2 font-terminal text-base transition-all duration-200 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                {session.user?.image && (
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      {session.user?.name?.split(' ')[0]}
                    </span>
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full border border-border"
                    />
                  </div>
                )}
                <ThemeToggle />
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 font-terminal text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <span>⏻</span>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-md border border-border"
                >
                  <span className="font-terminal text-primary">
                    {mobileMenuOpen ? '✕' : '☰'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/80 md:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-16 left-0 right-0 z-40 border-b border-border bg-background p-4 md:hidden"
              >
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-4 py-3 font-terminal text-base transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                        }`}
                      >
                        <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-3 px-4 py-2">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full border border-border"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-terminal text-base text-foreground">{session.user?.name}</p>
                      </div>
                    </div>
                    <MobileThemeToggle />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 font-terminal text-base text-destructive hover:bg-destructive/10"
                    >
                      <span>⏻</span>
                      Sign Out
                    </button>
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </main>

        {/* Subtle footer status */}
        <div className="fixed bottom-4 right-4 hidden lg:flex items-center gap-4 font-mono text-[10px] text-muted-foreground/50">
          <span>SYS: ONLINE</span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </CRTWrapper>
  );
}
