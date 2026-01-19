'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlowText, TerminalButton } from '@/components/crt';
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

  // Get initial values from URL params
  const viewParam = searchParams.get('view');
  const timeParam = searchParams.get('time');
  const initialView = validViewModes.includes(viewParam as ViewMode) ? (viewParam as ViewMode) : 'artists';
  const initialTime = validTimeRanges.includes(timeParam as TimeRange) ? (timeParam as TimeRange) : 'short_term';

  const [timeRange, setTimeRange] = useState<TimeRange>(initialTime);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  // Time range labels from translations
  const timeRangeLabels: Record<TimeRange, string> = {
    short_term: tDashboard('timeRanges.short'),
    medium_term: tDashboard('timeRanges.medium'),
    long_term: tDashboard('timeRanges.long'),
  };

  // Update URL with both params
  const updateUrl = (view: ViewMode, time: TimeRange) => {
    router.push(`/dashboard/top?view=${view}&time=${time}`, { scroll: false });
  };

  // Update URL when view mode changes
  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    updateUrl(view, timeRange);
  };

  // Update URL when time range changes
  const handleTimeChange = (time: TimeRange) => {
    setTimeRange(time);
    updateUrl(viewMode, time);
  };

  // Sync with URL params if they change (e.g., browser back/forward)
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-terminal text-3xl">
          <GlowText color="phosphor" size="sm">
            <span className="text-[#888888]">▲</span> {t('title')}
          </GlowText>
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4"
      >
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <TerminalButton
            variant={viewMode === 'artists' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('artists')}
          >
            {t('tabs.artists')}
          </TerminalButton>
          <TerminalButton
            variant={viewMode === 'tracks' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('tracks')}
          >
            {t('tabs.tracks')}
          </TerminalButton>
          <TerminalButton
            variant={viewMode === 'albums' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('albums')}
          >
            {t('tabs.albums')}
          </TerminalButton>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
            <TerminalButton
              key={range}
              variant={timeRange === range ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleTimeChange(range)}
            >
              {timeRangeLabels[range]}
            </TerminalButton>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={`${viewMode}-${timeRange}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {viewMode === 'artists' && <TopArtists limit={20} timeRange={timeRange} />}
        {viewMode === 'tracks' && <TopTracks limit={20} timeRange={timeRange} />}
        {viewMode === 'albums' && <TopAlbums limit={20} timeRange={timeRange} />}
      </motion.div>
    </div>
  );
}
