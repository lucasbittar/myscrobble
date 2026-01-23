'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { RadialChart } from '../visualizations/RadialChart';

interface SlidePatternsProps {
  byHour: Array<{ hour: number; count: number }>;
  byDay: Array<{ day: string; count: number }>;
}

function getPeakTimeLabel(peakHour: number, t: (key: string) => string): string {
  // Night owl: 22-4
  if (peakHour >= 22 || peakHour <= 4) {
    return t('slides.patterns.nightOwl');
  }
  // Early bird: 5-9
  if (peakHour >= 5 && peakHour <= 9) {
    return t('slides.patterns.earlyBird');
  }
  // Afternoon: 12-17
  if (peakHour >= 12 && peakHour <= 17) {
    return t('slides.patterns.afternoonVibes');
  }
  // Morning/evening default
  return t('slides.patterns.balancedListener');
}

export function SlidePatterns({ byHour, byDay }: SlidePatternsProps) {
  const t = useTranslations('wrapped');

  // Find peak hour
  const peakHourData = byHour.reduce(
    (max, h) => (h.count > max.count ? h : max),
    { hour: 0, count: 0 }
  );

  // Find most active day
  const peakDayData = byDay.reduce(
    (max, d) => (d.count > max.count ? d : max),
    { day: '', count: 0 }
  );

  const peakTimeLabel = getPeakTimeLabel(peakHourData.hour, t);
  const hasData = byHour.length > 0 || byDay.length > 0;

  if (!hasData) {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            {t('slides.patterns.title')}
          </h2>
          <p className="text-white/60">
            {t('slides.patterns.noData')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
          {t('slides.patterns.title')}
        </h2>
      </motion.div>

      {/* Radial chart */}
      {byHour.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <RadialChart data={byHour} color="#14B8A6" secondaryColor="#10B981" />
        </motion.div>
      )}

      {/* Peak time personality label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl text-white"
      >
        {peakTimeLabel}
      </motion.div>

      {/* Day breakdown */}
      {byDay.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <div className="flex justify-center gap-2">
            {byDay.map((day, index) => {
              const maxCount = Math.max(...byDay.map(d => d.count), 1);
              const intensity = day.count / maxCount;
              const isPeak = day.day === peakDayData.day;

              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className={`text-center ${isPeak ? 'scale-110' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      isPeak
                        ? 'bg-teal-500 text-white ring-2 ring-teal-400 ring-offset-2 ring-offset-transparent'
                        : 'bg-white/10 text-white/60'
                    }`}
                    style={{
                      opacity: isPeak ? 1 : 0.4 + intensity * 0.6,
                    }}
                  >
                    {day.day.slice(0, 2)}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {peakDayData.day && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-white/60 text-sm"
            >
              {t('slides.patterns.yourDay', { day: peakDayData.day })}
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
}
