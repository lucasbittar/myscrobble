'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlowText, TerminalCard, TerminalButton } from '@/components/crt';

interface HistoryItem {
  id: string;
  track_id: string;
  track_name: string;
  artist_id: string;
  artist_name: string;
  album_name: string | null;
  album_art_url: string | null;
  played_at: string;
  duration_ms: number;
}

interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

interface SyncStatus {
  synced: boolean;
  history_count?: number;
  user?: {
    last_synced_at: string | null;
  };
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' }) + ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Calculate date filter
  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { start_date: today.toISOString() };
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start_date: weekAgo.toISOString() };
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start_date: monthAgo.toISOString() };
      default:
        return {};
    }
  };

  // Fetch sync status
  const { data: syncStatus } = useQuery<SyncStatus>({
    queryKey: ['syncStatus'],
    queryFn: async () => {
      const res = await fetch('/api/sync/history');
      return res.json();
    },
  });

  // Fetch history from Supabase
  const { data: history, isLoading, error } = useQuery<HistoryResponse>({
    queryKey: ['history', dateRange, offset],
    queryFn: async () => {
      const filters = getDateFilter();
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(filters.start_date && { start_date: filters.start_date }),
      });
      const res = await fetch(`/api/history?${params}`);
      return res.json();
    },
    enabled: syncStatus?.synced === true,
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/sync/history', { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const totalPages = Math.ceil((history?.total || 0) / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-terminal text-3xl">
            <GlowText color="phosphor" size="sm">
              <span className="text-[#888888]">◎</span> Listening History
            </GlowText>
          </h1>
          <p className="mt-1 font-mono text-sm text-[#888888]">
            {syncStatus?.history_count || 0} tracks synced
            {syncStatus?.user?.last_synced_at && (
              <span className="ml-2 text-[#555555]">
                • Last sync: {new Date(syncStatus.user.last_synced_at).toLocaleString()}
              </span>
            )}
          </p>
        </div>

        <TerminalButton
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          glow
        >
          {syncMutation.isPending ? 'SYNCING...' : 'SYNC NOW'}
        </TerminalButton>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {(['all', 'today', 'week', 'month'] as const).map((range) => (
          <button
            key={range}
            onClick={() => {
              setDateRange(range);
              setOffset(0);
            }}
            className={`rounded-md border px-3 py-1 font-terminal text-xs transition-all ${
              dateRange === range
                ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)] text-[#00ff41]'
                : 'border-[rgba(0,255,65,0.2)] text-[#888888] hover:border-[#00ff41] hover:text-[#e0e0e0]'
            }`}
          >
            {range === 'all' ? 'ALL TIME' : range.toUpperCase()}
          </button>
        ))}
      </motion.div>

      {/* Sync prompt if not synced */}
      {!syncStatus?.synced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TerminalCard title="sync.required">
            <div className="space-y-4 text-center">
              <p className="font-mono text-sm text-[#888888]">
                Sync your listening history to view and filter your tracks.
              </p>
              <p className="font-mono text-xs text-[#555555]">
                This will save your last 50 played tracks to the database.
                Run it periodically to build your complete history.
              </p>
              <TerminalButton
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                glow
                size="lg"
              >
                {syncMutation.isPending ? 'SYNCING...' : 'START SYNC'}
              </TerminalButton>
            </div>
          </TerminalCard>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && syncStatus?.synced && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-terminal text-[#00ff41]"
          >
            LOADING HISTORY...
          </motion.div>
        </div>
      )}

      {/* History list */}
      {syncStatus?.synced && history?.items && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TerminalCard title="listening_history.log">
            {history.items.length === 0 ? (
              <p className="py-8 text-center font-mono text-sm text-[#888888]">
                No tracks found for this period
              </p>
            ) : (
              <div className="divide-y divide-[rgba(0,255,65,0.1)]">
                {history.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center gap-4 py-3 transition-colors hover:bg-[rgba(0,255,65,0.02)]"
                  >
                    {/* Album art */}
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-[rgba(0,255,65,0.2)]">
                      {item.album_art_url ? (
                        <Image
                          src={item.album_art_url}
                          alt={item.album_name || 'Album'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-[#555555]">
                          ♪
                        </div>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-terminal text-sm text-[#e0e0e0]">
                        {item.track_name}
                      </p>
                      <p className="truncate font-mono text-xs text-[#888888]">
                        {item.artist_name}
                      </p>
                    </div>

                    {/* Duration & time */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-mono text-xs text-[#00f5ff]">
                        {formatDuration(item.duration_ms)}
                      </p>
                      <p className="font-mono text-xs text-[#555555]">
                        {formatDate(item.played_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-[rgba(0,255,65,0.1)] pt-4">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="font-terminal text-xs text-[#00ff41] disabled:opacity-30"
                >
                  ← PREV
                </button>
                <span className="font-mono text-xs text-[#888888]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={currentPage >= totalPages}
                  className="font-terminal text-xs text-[#00ff41] disabled:opacity-30"
                >
                  NEXT →
                </button>
              </div>
            )}
          </TerminalCard>
        </motion.div>
      )}

      {/* Sync result message */}
      {syncMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.05)] p-3"
        >
          <p className="font-mono text-xs text-[#00ff41]">
            ✓ Synced {syncMutation.data?.synced || 0} new tracks
          </p>
        </motion.div>
      )}
    </div>
  );
}
