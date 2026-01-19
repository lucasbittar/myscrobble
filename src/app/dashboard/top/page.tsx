'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlowText, TerminalButton } from '@/components/crt';
import { TopArtists, TopTracks } from '@/components/dashboard';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type ViewMode = 'artists' | 'tracks';

const timeRangeLabels: Record<TimeRange, string> = {
  short_term: '4 Weeks',
  medium_term: '6 Months',
  long_term: 'All Time',
};

export default function TopChartsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [viewMode, setViewMode] = useState<ViewMode>('artists');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-terminal text-3xl">
          <GlowText color="phosphor" size="sm">
            <span className="text-[#888888]">▲</span> Top Charts
          </GlowText>
        </h1>
        <p className="mt-1 font-mono text-sm text-[#888888]">
          Your most played artists and tracks
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
            onClick={() => setViewMode('artists')}
          >
            Artists
          </TerminalButton>
          <TerminalButton
            variant={viewMode === 'tracks' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('tracks')}
          >
            Tracks
          </TerminalButton>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
            <TerminalButton
              key={range}
              variant={timeRange === range ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
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
        {viewMode === 'artists' ? (
          <TopArtists limit={20} timeRange={timeRange} />
        ) : (
          <TopTracks limit={20} timeRange={timeRange} />
        )}
      </motion.div>
    </div>
  );
}
