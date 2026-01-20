'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TopArtists, TopTracks, TopAlbums } from '@/components/dashboard';
import { useTranslations } from 'next-intl';

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

  return (
    <div className="min-h-screen py-12 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - Matching History page style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Title Row */}
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-medium tracking-[0.3em] text-[#1DB954] uppercase mb-2"
              >
                {t('subtitle')}
              </motion.p>
              <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
                {t('title')}
              </h1>
            </div>

            {/* Time Range Pills */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2"
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
                      ? 'relative z-10 bg-[#1DB954] text-white shadow-lg shadow-[#1DB954]/25'
                      : 'bg-white/60 dark:bg-white/10 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-white/20'
                  }`}
                >
                  {timeRangeLabels[range]}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2"
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
            key={`${viewMode}-${timeRange}`}
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
  );
}
