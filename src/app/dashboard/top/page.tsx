'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TopArtists, TopTracks, TopAlbums } from '@/components/dashboard';
import { useTranslations } from 'next-intl';
import {
  ShareProvider,
  ShareModal,
  FloatingShareButton,
  type TopChartsShareData,
  type ShareData,
} from '@/components/share';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type ViewMode = 'artists' | 'tracks' | 'albums';

const validViewModes: ViewMode[] = ['artists', 'tracks', 'albums'];
const validTimeRanges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

export default function TopChartsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('charts');
  const tDashboard = useTranslations('dashboard');

  const viewParam = searchParams.get('view');
  const timeParam = searchParams.get('time');
  const initialView = validViewModes.includes(viewParam as ViewMode) ? (viewParam as ViewMode) : 'artists';
  const initialTime = validTimeRanges.includes(timeParam as TimeRange) ? (timeParam as TimeRange) : 'short_term';

  const [timeRange, setTimeRange] = useState<TimeRange>(initialTime);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  const timeRangeLabels: Record<TimeRange, string> = {
    short_term: tDashboard('timeRanges.short'),
    medium_term: tDashboard('timeRanges.medium'),
    long_term: tDashboard('timeRanges.long'),
  };

  const updateUrl = (view: ViewMode, time: TimeRange) => {
    router.push(`/dashboard/top?view=${view}&time=${time}`, { scroll: false });
  };

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    updateUrl(view, timeRange);
  };

  const handleTimeChange = (time: TimeRange) => {
    setTimeRange(time);
    updateUrl(viewMode, time);
  };

  useEffect(() => {
    const newView = searchParams.get('view');
    const newTime = searchParams.get('time');

    if (validViewModes.includes(newView as ViewMode) && newView !== viewMode) {
      setViewMode(newView as ViewMode);
    }
    if (validTimeRanges.includes(newTime as TimeRange) && newTime !== timeRange) {
      setTimeRange(newTime as TimeRange);
    }
  }, [searchParams, viewMode, timeRange]);

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

  // Fetch data for share card based on current view
  const { data: shareItems } = useQuery({
    queryKey: ['share-top', viewMode, timeRange],
    queryFn: async () => {
      const endpoint = viewMode === 'artists'
        ? `/api/spotify/top-artists?time_range=${timeRange}&limit=5`
        : viewMode === 'tracks'
        ? `/api/spotify/top-tracks?time_range=${timeRange}&limit=5`
        : `/api/spotify/top-albums?time_range=${timeRange}&limit=5`;

      const res = await fetch(endpoint);
      if (!res.ok) return null;
      const data = await res.json();

      // Different API responses have different structures:
      // - top-artists: { name, images: [{url}] }
      // - top-tracks: { name, artists: [{name}], album: { images: [{url}] } }
      // - top-albums: { name, artist (string), image (string) }
      return (data.items || []).map((item: {
        name: string;
        images?: { url: string }[];
        artists?: { name: string }[];
        album?: { images?: { url: string }[] };
        artist?: string;
        image?: string;
      }) => ({
        name: item.name,
        subtitle: viewMode === 'tracks'
          ? item.artists?.[0]?.name
          : viewMode === 'albums'
            ? item.artist
            : undefined,
        image: viewMode === 'tracks'
          ? item.album?.images?.[0]?.url || ''
          : viewMode === 'albums'
            ? item.image || ''
            : item.images?.[0]?.url || '',
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Prepare share data
  const shareData: ShareData | null = shareItems && shareItems.length > 0 ? {
    type: 'top-charts',
    data: {
      type: viewMode,
      timeRange: timeRangeLabels[timeRange],
      items: shareItems,
    } as TopChartsShareData,
  } : null;

  return (
    <ShareProvider userName={userName}>
      <>
        <div className="min-h-screen py-8 md:py-24 px-4 md:px-12">
          <div className="max-w-7xl mx-auto">
        {/* Header Section - Stacked on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          {/* Title Row */}
          <div className="mb-6 md:mb-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-medium tracking-[1.5px] text-[#8B5CF6] uppercase mb-2"
            >
              {t('subtitle')}
            </motion.p>
            <h1 className="text-3xl md:text-6xl font-black text-foreground tracking-tight">
              {t('title')}
            </h1>

            {/* Controls Row - Time Range left, Share right on desktop */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
              {/* Time Range Pills */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2 relative z-10"
              >
                {(Object.keys(timeRangeLabels) as TimeRange[]).map((range, index) => (
                  <motion.button
                    key={range}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    onClick={() => handleTimeChange(range)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      timeRange === range
                        ? 'relative z-10 bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25'
                        : 'bg-white/60 dark:bg-white/10 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-white/20'
                    }`}
                  >
                    {timeRangeLabels[range]}
                  </motion.button>
                ))}
              </motion.div>

              {/* Share Button - floating on mobile, aligned right on desktop */}
              {shareData && (
                <FloatingShareButton
                  shareData={shareData}
                  theme="purple"
                  position="relative"
                  size="lg"
                  showLabel
                  mobileFixed
                />
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 relative z-10"
          >
            {(['artists', 'tracks', 'albums'] as ViewMode[]).map((view, index) => (
              <motion.button
                key={view}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => handleViewChange(view)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  viewMode === view
                    ? 'relative z-10 bg-foreground text-background shadow-lg'
                    : 'bg-white/60 dark:bg-white/10 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-white/20'
                }`}
              >
                {t(`tabs.${view}`)}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {viewMode === 'artists' && <TopArtists limit={20} timeRange={timeRange} />}
            {viewMode === 'tracks' && <TopTracks limit={20} timeRange={timeRange} />}
            {viewMode === 'albums' && <TopAlbums limit={20} timeRange={timeRange} />}
          </motion.div>
        </AnimatePresence>
          </div>
        </div>

        {/* Share Modal */}
        <ShareModal />
      </>
    </ShareProvider>
  );
}
