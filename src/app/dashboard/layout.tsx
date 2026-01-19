'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CRTWrapper, GlowText } from '@/components/crt';

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
            className="font-terminal text-2xl text-[#00ff41]"
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
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(0,255,65,0.1)] bg-[rgba(10,10,10,0.9)] backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.1)]">
                  <span className="font-terminal text-sm text-[#00ff41]">M</span>
                </div>
                <span className="hidden font-terminal text-lg sm:block">
                  <GlowText color="phosphor" size="sm">MyScrobble</GlowText>
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
                          ? 'text-[#00ff41]'
                          : 'text-[#666666] hover:text-[#e0e0e0]'
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-md bg-[rgba(0,255,65,0.1)] border border-[rgba(0,255,65,0.2)]"
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
                    <span className="font-mono text-sm text-[#666666]">
                      {session.user?.name?.split(' ')[0]}
                    </span>
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full border border-[rgba(0,255,65,0.2)]"
                    />
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 font-terminal text-xs text-[#666666] hover:text-[#ff4444] transition-colors"
                >
                  <span>⏻</span>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-md border border-[rgba(0,255,65,0.2)]"
                >
                  <span className="font-terminal text-[#00ff41]">
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
                className="fixed top-16 left-0 right-0 z-40 border-b border-[rgba(0,255,65,0.2)] bg-[#0a0a0a] p-4 md:hidden"
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
                            ? 'bg-[rgba(0,255,65,0.1)] text-[#00ff41]'
                            : 'text-[#888888] hover:bg-[rgba(0,255,65,0.05)] hover:text-[#e0e0e0]'
                        }`}
                      >
                        <span className={isActive ? 'text-[#00ff41]' : 'text-[#555555]'}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="mt-2 pt-2 border-t border-[rgba(0,255,65,0.1)]">
                    <div className="flex items-center gap-3 px-4 py-2">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full border border-[rgba(0,255,65,0.2)]"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-terminal text-base text-[#e0e0e0]">{session.user?.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-md px-4 py-3 font-terminal text-base text-[#ff4444] hover:bg-[rgba(255,68,68,0.1)]"
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
        <div className="fixed bottom-4 right-4 hidden lg:flex items-center gap-4 font-mono text-[10px] text-[#333333]">
          <span>SYS: ONLINE</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff41] animate-pulse" />
        </div>
      </div>
    </CRTWrapper>
  );
}
