'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const ADMIN_EMAIL = 'lucasbittar.magnani@gmail.com';

interface WaitlistEntry {
  id: string;
  email: string;
  spotify_id: string | null;
  spotify_name: string | null;
  spotify_image: string | null;
  created_at: string;
  notified_at: string | null;
  converted_at: string | null;
}

interface WaitlistData {
  entries: WaitlistEntry[];
  stats: {
    total: number;
    converted: number;
    pending: number;
  };
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-border/50">
      <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-4xl font-black" style={{ color }}>{value}</p>
    </div>
  );
}

function WaitlistRow({
  entry,
  position,
  onAction,
  isLoading
}: {
  entry: WaitlistEntry;
  position: number;
  onAction: (id: string, action: 'convert' | 'unconvert' | 'delete') => void;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isConverted = !!entry.converted_at;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(entry.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = entry.email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-border/50 ${
        isConverted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Position */}
        <div className="w-10 h-10 rounded-full bg-[#EC4899]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[#EC4899]">#{position}</span>
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            {entry.spotify_image && (
              <Image
                src={entry.spotify_image}
                alt={entry.spotify_name || 'User'}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="font-medium text-foreground truncate">
              {entry.spotify_name || 'Unknown User'}
            </span>
            {isConverted && (
              <span className="px-2 py-0.5 bg-[#1DB954]/20 text-[#1DB954] text-xs font-medium rounded-full">
                Added
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmail}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
            >
              {entry.email}
              {copied ? (
                <svg className="w-4 h-4 text-[#1DB954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Joined {formatDate(entry.created_at)}
            {entry.converted_at && ` • Added ${formatDate(entry.converted_at)}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isConverted ? (
            <button
              onClick={() => onAction(entry.id, 'unconvert')}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Undo
            </button>
          ) : (
            <button
              onClick={() => onAction(entry.id, 'convert')}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-[#1DB954] hover:bg-[#1DB954]/90 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Mark Added
            </button>
          )}
          <button
            onClick={() => onAction(entry.id, 'delete')}
            disabled={isLoading}
            className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminWaitlistPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [data, setData] = useState<WaitlistData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'converted'>('all');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/waitlist');
      if (res.status === 401) {
        setIsAuthorized(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setIsAuthorized(true);
    } catch (error) {
      console.error('Failed to fetch waitlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // First check if user is logged in
    const checkAuth = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();

        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        if (session.user.email !== ADMIN_EMAIL) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        fetchData();
      } catch {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, fetchData]);

  const handleAction = async (id: string, action: 'convert' | 'unconvert' | 'delete') => {
    if (action === 'delete' && !confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#EC4899] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don&apos;t have permission to view this page.</p>
          <Link
            href="/dashboard"
            className="text-[#1DB954] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredEntries = data?.entries.filter(entry => {
    if (filter === 'pending') return !entry.converted_at;
    if (filter === 'converted') return !!entry.converted_at;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                ← Back
              </Link>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-bold text-foreground">Waitlist Admin</h1>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">MyScrobble</span>
              <span className="text-sm text-muted-foreground">.fm</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total" value={data?.stats.total || 0} color="#8B5CF6" />
          <StatCard label="Pending" value={data?.stats.pending || 0} color="#EC4899" />
          <StatCard label="Added" value={data?.stats.converted || 0} color="#1DB954" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {(['all', 'pending', 'converted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#F59E0B]">
            <strong>Workflow:</strong> Copy the user&apos;s email → Add it in{' '}
            <a
              href="https://developer.spotify.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Spotify Developer Dashboard
            </a>
            {' '}→ User Management → Click &quot;Mark Added&quot; here
          </p>
        </div>

        {/* Waitlist entries */}
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No one on the waitlist yet' : `No ${filter} entries`}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <WaitlistRow
                key={entry.id}
                entry={entry}
                position={index + 1}
                onAction={handleAction}
                isLoading={actionLoading}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
