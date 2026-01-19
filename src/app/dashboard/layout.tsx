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
  { href: '/dashboard', label: 'Overview', icon: '◈' },
  { href: '/dashboard/history', label: 'History', icon: '◎' },
  { href: '/dashboard/top', label: 'Top Charts', icon: '▲' },
  { href: '/dashboard/discover', label: 'Discover', icon: '✦' },
  { href: '/dashboard/concerts', label: 'Concerts', icon: '♪' },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            LOADING DASHBOARD...
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
      <div className="flex min-h-screen">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-4 top-4 z-50 rounded-md border border-[rgba(0,255,65,0.3)] bg-[#0a0a0a] p-2 lg:hidden"
        >
          <span className="font-terminal text-[#00ff41]">{sidebarOpen ? '✕' : '☰'}</span>
        </button>

        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || typeof window !== 'undefined') && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: sidebarOpen ? 0 : typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -280 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[rgba(0,255,65,0.2)] bg-[#0a0a0a] lg:relative lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              }`}
            >
              <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="border-b border-[rgba(0,255,65,0.2)] p-4">
                  <Link href="/dashboard" className="block">
                    <h1 className="font-terminal text-2xl">
                      <GlowText color="phosphor" size="sm">
                        MyScrobble
                      </GlowText>
                    </h1>
                    <p className="font-terminal text-xs text-[#555555]">
                      v2.0 // Dashboard
                    </p>
                  </Link>
                </div>

                {/* User info */}
                <div className="border-b border-[rgba(0,255,65,0.2)] p-4">
                  <div className="flex items-center gap-3">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full border border-[rgba(0,255,65,0.3)]"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-terminal text-sm text-[#e0e0e0]">
                        {session.user?.name}
                      </p>
                      <p className="truncate font-mono text-xs text-[#00f5ff]">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 font-terminal text-sm transition-all ${
                              isActive
                                ? 'bg-[rgba(0,255,65,0.1)] text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)]'
                                : 'text-[#888888] hover:bg-[rgba(0,255,65,0.05)] hover:text-[#e0e0e0]'
                            }`}
                          >
                            <span className={isActive ? 'text-[#00ff41]' : 'text-[#555555]'}>
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer */}
                <div className="border-t border-[rgba(0,255,65,0.2)] p-4">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 font-terminal text-sm text-[#ff4444] transition-all hover:bg-[rgba(255,68,68,0.1)]"
                  >
                    <span>⏻</span>
                    LOGOUT
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </CRTWrapper>
  );
}
