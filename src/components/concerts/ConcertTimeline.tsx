'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import type { TourEvent } from '@/types/tour';
import { containerVariants, listItemVariants } from '@/lib/animations';

interface ConcertWithArtist extends TourEvent {
  artistName: string;
  artistImage?: string;
}

interface ConcertTimelineProps {
  concerts: ConcertWithArtist[];
}

interface DateGroup {
  label: string;
  key: string;
  concerts: ConcertWithArtist[];
}

export function ConcertTimeline({ concerts }: ConcertTimelineProps) {
  const t = useTranslations('concerts');
  const tTour = useTranslations('tour');
  const locale = useLocale();

  // Map next-intl locale to date locale
  const dateLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  // Group concerts by date period
  const dateGroups = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const groups: DateGroup[] = [];
    const thisWeek: ConcertWithArtist[] = [];
    const thisMonth: ConcertWithArtist[] = [];
    const later: ConcertWithArtist[] = [];

    for (const concert of concerts) {
      const concertDate = new Date(concert.date);
      if (concertDate < weekFromNow) {
        thisWeek.push(concert);
      } else if (concertDate < monthFromNow) {
        thisMonth.push(concert);
      } else {
        later.push(concert);
      }
    }

    if (thisWeek.length > 0) {
      groups.push({ label: t('thisWeek'), key: 'week', concerts: thisWeek });
    }
    if (thisMonth.length > 0) {
      groups.push({ label: t('thisMonth'), key: 'month', concerts: thisMonth });
    }
    if (later.length > 0) {
      groups.push({ label: t('later'), key: 'later', concerts: later });
    }

    return groups;
  }, [concerts, t]);

  if (dateGroups.length === 0) {
    return null;
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-16"
    >
      <h2 className="text-2xl font-bold text-foreground mb-8">{t('upcomingShows')}</h2>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-[#EC4899] via-border to-transparent" />

        {/* Date Groups */}
        <div className="space-y-12">
          {dateGroups.map((group) => (
            <motion.div key={group.key} variants={listItemVariants} className="space-y-6">
              {/* Date header with dot */}
              <div className="flex items-center gap-4">
                <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-[#EC4899] to-[#F472B6] flex items-center justify-center shadow-lg shadow-[#EC4899]/30">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-foreground">{group.label}</h3>
              </div>

              {/* Concert cards */}
              <div className="ml-[19px] pl-8 border-l border-transparent space-y-4">
                {group.concerts.map((concert, index) => (
                  <motion.div
                    key={`${concert.artistName}-${concert.date}-${index}`}
                    variants={listItemVariants}
                    className="group"
                  >
                    <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-transparent hover:border-[#EC4899]/30 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        {/* Artist Image */}
                        {concert.artistImage ? (
                          <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                            <Image
                              src={concert.artistImage}
                              alt={concert.artistName}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="flex w-16 h-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EC4899]/20 to-[#F472B6]/20">
                            <span className="text-2xl opacity-50">🎤</span>
                          </div>
                        )}

                        {/* Concert Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg text-foreground group-hover:text-[#EC4899] transition-colors truncate">
                              {concert.artistName}
                            </h4>
                            <OnTourBadge variant="compact" />
                          </div>

                          <p className="text-sm font-medium text-foreground truncate">
                            {concert.venue}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{concert.city}</p>

                          {/* Date and Distance */}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-medium text-[#EC4899]">
                              {new Date(concert.date).toLocaleDateString(dateLocale, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            {concert.distanceKm !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                {tTour('kmAway', { distance: concert.distanceKm })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ticket Button */}
                        {concert.ticketUrl && (
                          <a
                            href={concert.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-4 py-2 rounded-full bg-[#EC4899]/10 text-[#EC4899] text-sm font-medium hover:bg-[#EC4899]/20 transition-colors"
                          >
                            {tTour('getTickets')}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default ConcertTimeline;
