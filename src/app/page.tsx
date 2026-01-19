'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CRTWrapper, GlowText, TerminalButton, TerminalCard } from '@/components/crt';

// Spotify icon component
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

// Terminal line animation
function TerminalLine({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="font-mono text-sm md:text-base"
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check for session on mount
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
    // Use custom OAuth route instead of NextAuth's signIn
    router.push('/api/auth/signin/spotify');
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
            LOADING SYSTEM...
          </motion.div>
        </div>
      </CRTWrapper>
    );
  }

  return (
    <CRTWrapper>
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Background grid effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Main content */}
        <div className="relative z-10 w-full max-w-2xl">
          {/* Logo / Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="font-terminal text-5xl md:text-7xl">
              <GlowText color="phosphor" size="lg">
                MyScrobble
              </GlowText>
            </h1>
            <p className="mt-2 font-terminal text-lg text-[#888888]">
              <span className="text-[#00f5ff]">v2.0</span> // Spotify Dashboard
            </p>
          </motion.div>

          {/* Terminal Card */}
          <TerminalCard title="system.init" className="mb-8">
            <div className="space-y-2">
              <TerminalLine delay={0.2}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#888888]">Initializing MyScrobble...</span>
              </TerminalLine>
              <TerminalLine delay={0.4}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#00f5ff]">Loading Spotify API module</span>{' '}
                <span className="text-[#00ff41]">[OK]</span>
              </TerminalLine>
              <TerminalLine delay={0.6}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#00f5ff]">Loading AI recommendations</span>{' '}
                <span className="text-[#00ff41]">[OK]</span>
              </TerminalLine>
              <TerminalLine delay={0.8}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#00f5ff]">Loading concert discovery</span>{' '}
                <span className="text-[#00ff41]">[OK]</span>
              </TerminalLine>
              <TerminalLine delay={1.0}>
                <span className="text-[#00ff41]">&gt;</span>{' '}
                <span className="text-[#ff00ff]">Awaiting authentication...</span>
              </TerminalLine>
            </div>
          </TerminalCard>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <FeatureCard icon="📊" label="Listening Stats" color="phosphor" />
            <FeatureCard icon="🤖" label="AI Discover" color="cyan" />
            <FeatureCard icon="🎫" label="Concerts" color="magenta" />
            <FeatureCard icon="📱" label="Share" color="amber" />
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="flex justify-center"
          >
            <TerminalButton
              onClick={handleSpotifyLogin}
              size="lg"
              glow
              icon={<SpotifyIcon className="h-5 w-5" />}
              className="w-full md:w-auto"
            >
              CONNECT WITH SPOTIFY
            </TerminalButton>
          </motion.div>

          {/* Footer info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="mt-6 text-center font-mono text-xs text-[#555555]"
          >
            Your listening history stays private. We only analyze your data to provide insights.
          </motion.p>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="pointer-events-none absolute bottom-4 left-4 font-terminal text-xs text-[#333333]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div>SYS: READY</div>
          <div>MEM: 64KB FREE</div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-4 right-4 font-terminal text-xs text-[#333333]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div>BUILD: 2024.01</div>
          <div>NODE: ACTIVE</div>
        </motion.div>
      </div>
    </CRTWrapper>
  );
}

function FeatureCard({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: 'phosphor' | 'cyan' | 'magenta' | 'amber';
}) {
  const colorClasses = {
    phosphor: 'border-[rgba(0,255,65,0.3)] hover:border-[#00ff41] hover:shadow-[0_0_10px_rgba(0,255,65,0.3)]',
    cyan: 'border-[rgba(0,245,255,0.3)] hover:border-[#00f5ff] hover:shadow-[0_0_10px_rgba(0,245,255,0.3)]',
    magenta: 'border-[rgba(255,0,255,0.3)] hover:border-[#ff00ff] hover:shadow-[0_0_10px_rgba(255,0,255,0.3)]',
    amber: 'border-[rgba(255,176,0,0.3)] hover:border-[#ffb000] hover:shadow-[0_0_10px_rgba(255,176,0,0.3)]',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border bg-[#0d0d0d] p-4 transition-all duration-300 ${colorClasses[color]}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="mt-1 font-terminal text-xs text-[#888888]">{label}</span>
    </div>
  );
}
