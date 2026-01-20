'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TopArtists, TopTracks, TopAlbums } from '@/components/dashboard';
import { useTranslations } from 'next-intl';
import { Heading, ModernButton, ScrollReveal } from '@/components/modern';

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
    <div className="py-12 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <ScrollReveal>
        <Heading level={2}>{t('title')}</Heading>
        <p className="mt-1 text-muted-foreground">
          {t('subtitle')}
        </p>
      </ScrollReveal>

      {/* Controls */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex gap-2 p-1 bg-secondary rounded-xl">
            {(['artists', 'tracks', 'albums'] as ViewMode[]).map((view) => (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === view
                    ? 'bg-background text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`tabs.${view}`)}
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleTimeChange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  timeRange === range
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {timeRangeLabels[range]}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

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
    </div>
  );
}
