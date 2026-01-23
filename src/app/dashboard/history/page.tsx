'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import {
  ShareProvider,
  ShareModal,
  FloatingShareButton,
  type HistoryShareData,
  type ShareData,
} from '@/components/share';

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

interface GroupedHistory {
  date: string;
  dateLabel: string;
  dayOfWeek: string;
  tracks: HistoryItem[];
}

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const t = useTranslations('history');
  const tCommon = useTranslations('common');
  const locale = useLocale();

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

  // Group tracks by day
  const groupedHistory = useMemo<GroupedHistory[]>(() => {
    if (!history?.items) return [];

    const groups: Map<string, HistoryItem[]> = new Map();

    history.items.forEach((item) => {
      const date = new Date(item.played_at);
      const dateKey = date.toISOString().split('T')[0];

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(item);
    });

    return Array.from(groups.entries()).map(([dateKey, tracks]) => {
      const date = new Date(dateKey);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isYesterday = date.toDateString() === new Date(now.getTime() - 86400000).toDateString();

      let dateLabel: string;
      if (isToday) {
        dateLabel = t('today');
      } else if (isYesterday) {
        dateLabel = t('yesterday');
      } else {
        dateLabel = date.toLocaleDateString(locale, { month: 'long', day: 'numeric' });
      }

      return {
        date: dateKey,
        dateLabel,
        dayOfWeek: date.toLocaleDateString(locale, { weekday: 'long' }),
        tracks,
      };
    });
  }, [history?.items, locale]);

  const totalPages = Math.ceil((history?.total || 0) / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // Get user info for share
  const [userName, setUserName] = useState('User');
  useEffect(() => {
    fetch('/api/spotify/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.display_name) setUserName(data.display_name);
      })
      .catch(() => {});
  }, []);

  // Prepare share data
  const shareData: ShareData | null = history?.items && history.items.length > 0 ? {
    type: 'history',
    data: {
      recentTracks: history.items.slice(0, 9).map(item => ({
        trackName: item.track_name,
        artistName: item.artist_name,
        albumImage: item.album_art_url || '',
      })),
    } as HistoryShareData,
  } : null;

  return (
    <ShareProvider userName={userName}>
      <>
        <div className="min-h-screen py-8 md:py-24 px-4 md:px-12">
          <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          {/* Title Row - Stacked on mobile */}
          <div className="mb-6 md:mb-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-medium tracking-[1.5px] text-[#1DB954] uppercase mb-2"
            >
              {t('subtitle')}
            </motion.p>
            <h1 className="text-3xl md:text-6xl font-black text-foreground tracking-tight">
              {t('title')}
            </h1>
            <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground">
              {t('tracksSynced', { count: syncStatus?.history_count || 0 })}
              {syncStatus?.user?.last_synced_at && (
                <span className="ml-2 md:ml-3 text-xs md:text-sm opacity-60">
                  • {t('lastSync', { date: new Date(syncStatus.user.last_synced_at).toLocaleDateString(locale) })}
                </span>
              )}
            </p>

            {/* Sync Button - inline on mobile */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="group relative mt-4 px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-[#1DB954] text-white font-semibold overflow-hidden transition-all hover:shadow-lg hover:shadow-[#1DB954]/25 disabled:opacity-50 cursor-pointer text-sm md:text-base"
            >
              <span className="relative z-10 flex items-center gap-2">
                {syncMutation.isPending ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    {tCommon('syncing')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {tCommon('syncNow')}
                  </>
                )}
              </span>
            </motion.button>

            {/* Share Button - floating on mobile via mobileFixed prop */}
            {shareData && (
              <FloatingShareButton
                shareData={shareData}
                theme="green"
                position="relative"
                size="lg"
                showLabel
                mobileFixed
              />
            )}
          </div>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 relative z-10"
          >
            {(['all', 'today', 'week', 'month'] as const).map((range, index) => (
              <motion.button
                key={range}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => {
                  setDateRange(range);
                  setOffset(0);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  dateRange === range
                    ? 'relative z-10 bg-foreground text-background shadow-lg'
                    : 'bg-white/60 dark:bg-white/10 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-white/20'
                }`}
              >
                {t(`filters.${range}`)}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Sync Prompt */}
        {!syncStatus?.synced && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative py-20 text-center"
          >
            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-6 opacity-80"
              >
                🎵
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{t('sync.required')}</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {t('sync.description')}
              </p>
              <button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className="px-8 py-4 rounded-full bg-[#1DB954] text-white font-bold text-lg hover:shadow-xl hover:shadow-[#1DB954]/30 transition-all cursor-pointer"
              >
                {syncMutation.isPending ? tCommon('syncing') : tCommon('startSync')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && syncStatus?.synced && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-2 border-[#1DB954] border-t-transparent mb-4"
            />
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        )}

        {/* Timeline View */}
        {syncStatus?.synced && history?.items && !isLoading && (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[23px] md:left-[31px] top-0 bottom-0 w-px bg-gradient-to-b from-[#1DB954] via-border to-transparent" />

            {history.items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <p className="text-lg text-muted-foreground">{t('noTracks')}</p>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {groupedHistory.map((group, groupIndex) => (
                  <motion.div
                    key={group.date}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    {/* Date Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#1DB954] to-[#14B8A6] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
                        <span className="text-white font-bold text-sm md:text-base">
                          {new Date(group.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">
                          {group.dateLabel}
                        </h3>
                        <p className="text-sm text-muted-foreground">{group.dayOfWeek}</p>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                      <span className="text-sm text-muted-foreground">
                        {group.tracks.length} {group.tracks.length === 1 ? tCommon('track') : tCommon('tracks')}
                      </span>
                    </div>

                    {/* Tracks Grid */}
                    <div className="ml-6 md:ml-8 pl-6 md:pl-8 space-y-3">
                      {group.tracks.map((item, trackIndex) => (
                        <motion.a
                          key={item.id}
                          href={`https://open.spotify.com/track/${item.track_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: groupIndex * 0.1 + trackIndex * 0.03 }}
                          className="group flex items-center gap-4 p-3 md:p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-transparent hover:border-[#1DB954]/30 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg transition-all cursor-pointer"
                        >
                          {/* Time Badge */}
                          <div className="hidden sm:flex flex-col items-center justify-center w-14 text-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              {formatTime(item.played_at)}
                            </span>
                          </div>

                          {/* Album Art */}
                          <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-xl transition-shadow">
                            {item.album_art_url ? (
                              <Image
                                src={item.album_art_url}
                                alt={item.album_name || 'Album'}
                                fill
                                sizes="64px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                                <span className="text-2xl opacity-50">♪</span>
                              </div>
                            )}
                            {/* Play indicator on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>

                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate group-hover:text-[#1DB954] transition-colors">
                              {item.track_name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {item.artist_name}
                            </p>
                            <p className="text-xs text-muted-foreground/60 truncate mt-0.5 hidden md:block">
                              {item.album_name}
                            </p>
                          </div>

                          {/* Duration & Mobile Time */}
                          <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-medium text-[#1DB954]">
                              {formatDuration(item.duration_ms)}
                            </p>
                            <p className="text-xs text-muted-foreground sm:hidden">
                              {formatTime(item.played_at)}
                            </p>
                          </div>

                          {/* Arrow */}
                          <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 text-[#1DB954]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border/50"
              >
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/60 dark:bg-white/10 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {tCommon('prev')}
                </button>
                <span className="text-sm text-muted-foreground">
                  {tCommon('page', { current: currentPage, total: totalPages })}
                </span>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={currentPage >= totalPages}
                  className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/60 dark:bg-white/10 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {tCommon('next')}
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Sync Success Toast */}
        {syncMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 right-8 px-6 py-3 rounded-full bg-[#1DB954] text-white font-medium shadow-xl shadow-[#1DB954]/30"
          >
            {tCommon('synced', { count: syncMutation.data?.synced || 0 })}
          </motion.div>
        )}
      </div>

        {/* Share Modal */}
        <ShareModal />
      </div>
      </>
    </ShareProvider>
  );
}
