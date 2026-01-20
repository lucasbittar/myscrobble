'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { TourEvent } from '@/types/tour';

interface UpcomingConcertsProps {
  topArtists: Array<{
    id: string;
    name: string;
  }>;
}

interface ConcertWithArtist extends TourEvent {
  artistName: string;
}

export function UpcomingConcerts({ topArtists }: UpcomingConcertsProps) {
  const t = useTranslations('tour');
  const tCommon = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  const locale = useLocale();
  const { location, loading: locationLoading, usingActualLocation, requestPermission } = useGeolocation();

  const artistNames = topArtists.slice(0, 5).map((a) => a.name);

  const { data: tourData, isLoading } = useTourStatusBatch(
    artistNames,
    location?.lat,
    location?.lng
  );

  // Combine all events from all artists, deduplicate, and sort by date
  const concertsMap = new Map<string, ConcertWithArtist>();
  if (tourData) {
    for (const [artistName, status] of Object.entries(tourData)) {
      for (const event of status.events) {
        // Create unique key: artist + date (ignore venue differences for same day)
        const dateKey = event.date.split('T')[0]; // Use only date part
        const uniqueKey = `${artistName}-${dateKey}`;

        // Only add if not already present (keeps first occurrence)
        if (!concertsMap.has(uniqueKey)) {
          concertsMap.set(uniqueKey, { ...event, artistName });
        }
      }
    }
  }

  // Convert to array, sort by date, and take first 5
  const displayConcerts = Array.from(concertsMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (isLoading || locationLoading) {
    return (
      <section className="relative">
        {/* Section header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <span className="text-xs font-medium tracking-[0.2em] text-[#EC4899] uppercase">
              {tDashboard('sections.liveEvents')}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-[#EC4899]/30 to-transparent" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-foreground"
          >
            {t('upcoming')}
          </motion.h3>
        </div>

        {/* Loading state */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 py-12"
        >
          <div className="relative">
            <motion.div
              className="w-3 h-3 rounded-full bg-[#EC4899]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 w-3 h-3 rounded-full bg-[#EC4899]"
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {t('searching')}
          </span>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative">
      {/* Decorative background element */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-[#EC4899]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Section header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <span className="text-xs font-medium tracking-[0.2em] text-[#EC4899] uppercase">
            {tDashboard('sections.liveEvents')}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-[#EC4899]/30 to-transparent" />
        </motion.div>
        <div className="flex items-end justify-between">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-foreground"
          >
            {t('upcoming')}
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/dashboard/concerts"
              className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#EC4899] transition-colors"
            >
              <span>{tCommon('viewAll')}</span>
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Location permission prompt */}
      {!usingActualLocation && !locationLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#EC4899]/10 via-[#8B5CF6]/10 to-[#EC4899]/10 border border-[#EC4899]/20"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#EC4899]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-foreground/80">
                {t('locationHint')}
              </p>
            </div>
            <button
              onClick={requestPermission}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-[#EC4899] text-white text-sm font-medium hover:bg-[#DB2777] transition-colors cursor-pointer"
            >
              {t('enableLocation')}
            </button>
          </div>
        </motion.div>
      )}

      {displayConcerts.length > 0 ? (
        <div className="space-y-4">
          {displayConcerts.map((concert, index) => {
            const concertDate = new Date(concert.date);
            const day = concertDate.getDate();
            const month = concertDate.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
            const weekday = concertDate.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase();

            return (
              <motion.div
                key={`${concert.artistName}-${concert.date}-${concert.venue}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                {/* Concert card with editorial layout */}
                <div className="relative flex items-stretch gap-6 p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-border/50 hover:border-[#EC4899]/30 hover:shadow-lg hover:shadow-[#EC4899]/5 transition-all duration-300">
                  {/* Date column - Large editorial style */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 md:w-24 border-r border-border/50 pr-6">
                    <span className="text-[10px] font-medium tracking-widest text-[#EC4899]">
                      {weekday}
                    </span>
                    <span className="text-4xl md:text-5xl font-black text-foreground leading-none my-1">
                      {day}
                    </span>
                    <span className="text-xs font-medium tracking-wider text-muted-foreground">
                      {month}
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4 className="text-lg md:text-xl font-bold text-foreground truncate group-hover:text-[#EC4899] transition-colors">
                      {concert.artistName}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {concert.venue}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground/70">
                        {concert.city}
                      </span>
                      {concert.distanceKm !== undefined && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-xs font-medium text-[#EC4899]">
                            {t('kmAway', { distance: concert.distanceKm })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  {concert.ticketUrl && (
                    <div className="flex-shrink-0 flex items-center">
                      <a
                        href={concert.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn relative overflow-hidden px-5 py-2.5 rounded-full bg-[#EC4899] text-white text-sm font-semibold hover:bg-[#DB2777] transition-colors"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {tCommon('tickets')}
                          <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </a>
                    </div>
                  )}

                  {/* Hover gradient accent */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#EC4899]/5 via-transparent to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative py-16 text-center"
        >
          {/* Empty state with editorial flair */}
          <div className="relative inline-block mb-6">
            <motion.div
              className="text-7xl opacity-20"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🎤
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#EC4899]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            {t('noUpcoming')}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {t('fromTopArtists')}
          </p>
        </motion.div>
      )}
    </section>
  );
}
