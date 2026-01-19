'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { GlowText, TerminalCard } from '@/components/crt';
import { NowPlaying, RecentTracks, TopArtistsList, TopTracksList } from '@/components/dashboard';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-terminal text-3xl md:text-4xl">
          <GlowText color="phosphor" size="sm">
            {greeting}, {session?.user?.name?.split(' ')[0] || 'User'}
          </GlowText>
        </h1>
        <p className="mt-1 font-mono text-sm text-[#888888]">
          Here&apos;s your listening activity overview
        </p>
      </motion.div>

      {/* Now Playing - Full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NowPlaying />
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-terminal text-lg text-[#e0e0e0]">
              <span className="text-[#00ff41]">◎</span> Recent Tracks
            </h2>
            <Link
              href="/dashboard/history"
              className="font-mono text-xs text-[#00f5ff] hover:text-[#00ff41]"
            >
              View all →
            </Link>
          </div>
          <RecentTracks limit={8} showTitle={false} />
        </motion.div>

        {/* Top Artists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-terminal text-lg text-[#e0e0e0]">
              <span className="text-[#00f5ff]">▲</span> Top Artists
            </h2>
            <Link
              href="/dashboard/top"
              className="font-mono text-xs text-[#00f5ff] hover:text-[#00ff41]"
            >
              View all →
            </Link>
          </div>
          <TerminalCard animate={false}>
            <TopArtistsList limit={5} timeRange="short_term" />
          </TerminalCard>
        </motion.div>
      </div>

      {/* Top Tracks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-terminal text-lg text-[#e0e0e0]">
            <span className="text-[#ff00ff]">♪</span> Top Tracks This Month
          </h2>
          <Link
            href="/dashboard/top"
            className="font-mono text-xs text-[#00f5ff] hover:text-[#00ff41]"
          >
            View all →
          </Link>
        </div>
        <TerminalCard animate={false}>
          <TopTracksList limit={5} timeRange="short_term" />
        </TerminalCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <QuickActionCard
          href="/dashboard/discover"
          icon="✦"
          label="AI Discover"
          description="Get personalized recommendations"
          color="cyan"
        />
        <QuickActionCard
          href="/dashboard/concerts"
          icon="♪"
          label="Concerts"
          description="Find upcoming shows"
          color="magenta"
        />
        <QuickActionCard
          href="/dashboard/wrapped"
          icon="◆"
          label="Wrapped"
          description="Your listening story"
          color="amber"
        />
        <QuickActionCard
          href="/dashboard/share"
          icon="◫"
          label="Share"
          description="Create shareable cards"
          color="phosphor"
        />
      </motion.div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function QuickActionCard({
  href,
  icon,
  label,
  description,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
  color: 'phosphor' | 'cyan' | 'magenta' | 'amber';
}) {
  const colorClasses = {
    phosphor: 'border-[rgba(0,255,65,0.2)] hover:border-[#00ff41] hover:shadow-[0_0_15px_rgba(0,255,65,0.2)]',
    cyan: 'border-[rgba(0,245,255,0.2)] hover:border-[#00f5ff] hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]',
    magenta: 'border-[rgba(255,0,255,0.2)] hover:border-[#ff00ff] hover:shadow-[0_0_15px_rgba(255,0,255,0.2)]',
    amber: 'border-[rgba(255,176,0,0.2)] hover:border-[#ffb000] hover:shadow-[0_0_15px_rgba(255,176,0,0.2)]',
  };

  const iconColors = {
    phosphor: 'text-[#00ff41]',
    cyan: 'text-[#00f5ff]',
    magenta: 'text-[#ff00ff]',
    amber: 'text-[#ffb000]',
  };

  return (
    <Link
      href={href}
      className={`group block rounded-lg border bg-[#0d0d0d] p-4 transition-all duration-300 ${colorClasses[color]}`}
    >
      <div className={`mb-2 text-2xl ${iconColors[color]}`}>{icon}</div>
      <h3 className="font-terminal text-sm text-[#e0e0e0] group-hover:text-[#00ff41]">
        {label}
      </h3>
      <p className="mt-1 font-mono text-xs text-[#555555]">{description}</p>
    </Link>
  );
}
