'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ModernCard, ModernButton, ModernBadge, Heading, ScrollReveal } from '@/components/modern';

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
  const t = useTranslations('history');
  const tCommon = useTranslations('common');

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

  const { data: syncStatus } = useQuery<SyncStatus>({
    queryKey: ['syncStatus'],
    queryFn: async () => {
      const res = await fetch('/api/sync/history');
      return res.json();
    },
  });

  const { data: history, isLoading } = useQuery<HistoryResponse>({
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
    <div className="py-12 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Heading level={2}>{t('title')}</Heading>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('tracksSynced', { count: syncStatus?.history_count || 0 })}
              {syncStatus?.user?.last_synced_at && (
                <span className="ml-2 text-muted-foreground/60">
                  • {t('lastSync', { date: new Date(syncStatus.user.last_synced_at).toLocaleString() })}
                </span>
              )}
            </p>
          </div>

          <ModernButton
            onClick={() => syncMutation.mutate()}
            loading={syncMutation.isPending}
          >
            {syncMutation.isPending ? tCommon('syncing') : tCommon('syncNow')}
          </ModernButton>
        </div>
      </ScrollReveal>

      {/* Filters */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-wrap gap-2">
          {(['all', 'today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {
                setDateRange(range);
                setOffset(0);
              }}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                dateRange === range
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {t(`filters.${range}`)}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Sync prompt if not synced */}
      {!syncStatus?.synced && (
        <ScrollReveal delay={0.2}>
          <ModernCard className="text-center py-12">
            <div className="space-y-4">
              <div className="text-5xl opacity-50">🎵</div>
              <Heading level={4}>{t('sync.required')}</Heading>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('sync.description')}
              </p>
              <p className="text-sm text-muted-foreground/60">
                {t('sync.hint')}
              </p>
              <ModernButton
                onClick={() => syncMutation.mutate()}
                loading={syncMutation.isPending}
                size="lg"
              >
                {syncMutation.isPending ? tCommon('syncing') : tCommon('startSync')}
              </ModernButton>
            </div>
          </ModernCard>
        </ScrollReveal>
      )}

      {/* Loading state */}
      {isLoading && syncStatus?.synced && (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-muted-foreground">{t('loading')}</span>
          </motion.div>
        </div>
      )}

      {/* History list */}
      {syncStatus?.synced && history?.items && (
        <ScrollReveal delay={0.2}>
          <ModernCard padding="none">
            {history.items.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">{t('noTracks')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/30"
                  >
                    {/* Album art */}
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                      {item.album_art_url ? (
                        <Image
                          src={item.album_art_url}
                          alt={item.album_name || 'Album'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                          ♪
                        </div>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {item.track_name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.artist_name}
                      </p>
                    </div>

                    {/* Duration & time */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-primary font-medium">
                        {formatDuration(item.duration_ms)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.played_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border p-4">
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  {tCommon('prev')}
                </ModernButton>
                <span className="text-sm text-muted-foreground">
                  {tCommon('page', { current: currentPage, total: totalPages })}
                </span>
                <ModernButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={currentPage >= totalPages}
                >
                  {tCommon('next')}
                </ModernButton>
              </div>
            )}
          </ModernCard>
        </ScrollReveal>
      )}

      {/* Sync result message */}
      {syncMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ModernBadge color="success" size="lg">
            {tCommon('synced', { count: syncMutation.data?.synced || 0 })}
          </ModernBadge>
        </motion.div>
      )}
      </div>
    </div>
  );
}
