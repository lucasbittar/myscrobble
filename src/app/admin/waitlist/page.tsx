'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const ADMIN_EMAIL = 'lucasbittar.magnani@gmail.com';
const SLEEPER_DAYS = 7; // Days of inactivity to be considered a "sleeper"

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

interface ActiveUser {
  id: string;
  spotify_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  last_active_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface UsersData {
  users: ActiveUser[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    sleepers: number;
    maxUsers: number;
    slotsAvailable: number;
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

function ActiveUserRow({
  user,
  onAction,
  isLoading,
  isSleeper,
}: {
  user: ActiveUser;
  onAction: (id: string, action: 'bounce' | 'reactivate') => void;
  isLoading: boolean;
  isSleeper: boolean;
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getDaysInactive = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysInactive = getDaysInactive(user.last_active_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl p-4 border ${
        isSleeper ? 'border-amber-500/50' : 'border-border/50'
      } ${!user.is_active ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          !user.is_active ? 'bg-gray-400' : isSleeper ? 'bg-amber-500' : 'bg-[#1DB954]'
        }`} />

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            {user.avatar_url && (
              <Image
                src={user.avatar_url}
                alt={user.display_name || 'User'}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="font-medium text-foreground truncate">
              {user.display_name || 'Unknown User'}
            </span>
            {!user.is_active && (
              <span className="px-2 py-0.5 bg-gray-500/20 text-gray-500 text-xs font-medium rounded-full">
                Bounced
              </span>
            )}
            {user.is_active && isSleeper && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 text-xs font-medium rounded-full">
                Sleeper
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {user.email || 'No email'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last active: {formatDate(user.last_active_at)}
            {daysInactive !== null && daysInactive >= SLEEPER_DAYS && (
              <span className="text-amber-600 ml-2">({daysInactive} days inactive)</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user.is_active ? (
            <button
              onClick={() => onAction(user.id, 'bounce')}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Bounce
            </button>
          ) : (
            <button
              onClick={() => onAction(user.id, 'reactivate')}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>
    </motion.div>
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
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'converted'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'waitlist'>('users');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'sleepers' | 'bounced'>('all');

  const fetchWaitlistData = useCallback(async () => {
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
    }
  }, []);

  const fetchUsersData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 401) {
        setIsAuthorized(false);
        return;
      }
      const json = await res.json();
      setUsersData(json);
      setIsAuthorized(true);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    await Promise.all([fetchWaitlistData(), fetchUsersData()]);
    setIsLoading(false);
  }, [fetchWaitlistData, fetchUsersData]);

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

  const handleUserAction = async (id: string, action: 'bounce' | 'reactivate') => {
    const confirmMsg = action === 'bounce'
      ? 'Are you sure you want to bounce this user? They will be redirected to the waitlist on their next visit.'
      : 'Are you sure you want to reactivate this user?';

    if (!confirm(confirmMsg)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        fetchData(); // Refresh data
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Action failed');
      }
    } catch (error) {
      console.error('User action failed:', error);
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

  // Filter users based on selection
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - SLEEPER_DAYS);

  const isUserSleeper = (user: ActiveUser) => {
    if (!user.last_active_at) return false;
    return new Date(user.last_active_at) < sevenDaysAgo;
  };

  const filteredUsers = usersData?.users.filter(user => {
    if (userFilter === 'active') return user.is_active && !isUserSleeper(user);
    if (userFilter === 'sleepers') return user.is_active && isUserSleeper(user);
    if (userFilter === 'bounced') return !user.is_active;
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
              <h1 className="text-xl font-bold text-foreground">Bouncer Admin</h1>
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
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#1DB954] text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Users ({usersData?.stats.active || 0}/{usersData?.stats.maxUsers || 25})
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'waitlist'
                ? 'bg-[#EC4899] text-white'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Waitlist ({data?.stats.pending || 0})
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            {/* Users Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <StatCard label="Active" value={usersData?.stats.active || 0} color="#1DB954" />
              <StatCard label="Sleepers" value={usersData?.stats.sleepers || 0} color="#F59E0B" />
              <StatCard label="Bounced" value={usersData?.stats.inactive || 0} color="#6B7280" />
              <StatCard label="Slots Free" value={usersData?.stats.slotsAvailable || 0} color="#8B5CF6" />
            </div>

            {/* Sleeper Warning */}
            {(usersData?.stats.sleepers || 0) > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-600">
                  <strong>⚠️ {usersData?.stats.sleepers} users</strong> have been inactive for {SLEEPER_DAYS}+ days.
                  Consider bouncing them to free up slots for waitlist users.
                </p>
              </div>
            )}

            {/* User Filters */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Filter:</span>
              {(['all', 'active', 'sleepers', 'bounced'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                    userFilter === f
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👤</div>
                  <p className="text-muted-foreground">
                    {userFilter === 'all' ? 'No users yet' : `No ${userFilter} users`}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <ActiveUserRow
                    key={user.id}
                    user={user}
                    onAction={handleUserAction}
                    isLoading={actionLoading}
                    isSleeper={user.is_active && isUserSleeper(user)}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Waitlist Stats */}
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
          </>
        )}
      </main>
    </div>
  );
}
