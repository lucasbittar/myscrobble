'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import type { TourEvent } from '@/types/tour';
import { heroVariants } from '@/lib/animations';

interface ConcertWithArtist extends TourEvent {
  artistName: string;
  artistImage?: string;
}

interface ConcertHeroProps {
  concert: ConcertWithArtist;
}

export function ConcertHero({ concert }: ConcertHeroProps) {
  const t = useTranslations('concerts');
  const tTour = useTranslations('tour');
  const locale = useLocale();

  // Map next-intl locale to date locale
  const dateLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  // Format date
  const concertDate = new Date(concert.date);
  const dateFormatted = concertDate.toLocaleDateString(dateLocale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate days until concert
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((concertDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.section variants={heroVariants} initial="hidden" animate="visible" className="mb-16">
      <p className="text-xs font-medium tracking-[0.3em] text-[#EC4899] uppercase mb-6">
        {t('nextShow')}
      </p>

      <div className="relative flex flex-col md:flex-row gap-8 items-start">
        {/* Large Artist Image */}
        <motion.div
          className="relative w-full md:w-80 lg:w-96 aspect-square flex-shrink-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/20"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {concert.artistImage ? (
            <Image
              src={concert.artistImage}
              alt={concert.artistName}
              fill
              quality={100}
              sizes="(max-width: 768px) 100vw, 384px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#EC4899]/30 to-[#F472B6]/30 flex items-center justify-center">
              <span className="text-8xl opacity-50">🎤</span>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Days Until Badge */}
          <div className="absolute top-4 left-4">
            <div className="px-4 py-2 rounded-full bg-[#EC4899] text-white font-bold text-sm shadow-lg shadow-[#EC4899]/30">
              {daysUntil === 0
                ? t('today')
                : daysUntil === 1
                ? t('tomorrow')
                : t('inDays', { days: daysUntil })}
            </div>
          </div>
        </motion.div>

        {/* Artist Details - Ticket-stub Glass Card */}
        <div className="flex-1 md:-ml-12 md:mt-12 relative z-10 w-full">
          <div className="p-6 md:p-8 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl border-l-4 border-l-[#EC4899]">
            {/* Date Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-2 rounded-lg bg-[#EC4899]/10 text-[#EC4899] font-semibold text-sm">
                {concertDate.toLocaleDateString(dateLocale, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <OnTourBadge variant="badge" />
            </div>

            {/* Artist Name */}
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-2">
              {concert.artistName}
            </h2>

            {/* Venue & City */}
            <div className="mb-6">
              <p className="text-lg font-medium text-foreground">{concert.venue}</p>
              <p className="text-muted-foreground">{concert.city}</p>
            </div>

            {/* Full Date */}
            <p className="text-sm text-muted-foreground mb-6">{dateFormatted}</p>

            {/* Distance & Tickets Row */}
            <div className="flex flex-wrap items-center gap-4">
              {concert.distanceKm !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 text-sm">
                  <svg
                    className="w-4 h-4 text-[#EC4899]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    {tTour('kmAway', { distance: concert.distanceKm })}
                  </span>
                </div>
              )}

              {concert.ticketUrl && (
                <a
                  href={concert.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EC4899] text-white font-semibold text-sm hover:bg-[#DB2777] transition-colors shadow-lg shadow-[#EC4899]/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                  {tTour('getTickets')}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default ConcertHero;
