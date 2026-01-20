'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { OnTourBadge } from '@/components/ui/OnTourBadge';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslations } from 'next-intl';
import type { TourEvent } from '@/types/tour';
import { ModernCard, ModernButton, Heading, ScrollReveal } from '@/components/modern';

interface TopArtist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface ConcertWithArtist extends TourEvent {
  artistName: string;
  artistImage?: string;
}

async function fetchTopArtists(): Promise<TopArtist[]> {
  const res = await fetch('/api/spotify/top-artists?time_range=medium_term&limit=20');
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export default function ConcertsPage() {
  const t = useTranslations('concerts');
  const tTour = useTranslations('tour');

  // Fetch user's top artists
  const { data: topArtists, isLoading: artistsLoading } = useQuery({
    queryKey: ['top-artists-concerts'],
    queryFn: fetchTopArtists,
  });

  // Get geolocation
  const { location, loading: locationLoading, permissionDenied, requestPermission } = useGeolocation();

  // Get tour status for all top artists
  const artistNames = topArtists?.map((a) => a.name) || [];
  const { data: tourStatus, isLoading: tourLoading } = useTourStatusBatch(
    artistNames,
    location?.lat,
    location?.lng
  );

  // Combine all concerts from all artists and deduplicate
  const concertsMap = new Map<string, ConcertWithArtist>();
  if (tourStatus && topArtists) {
    for (const artist of topArtists) {
      const status = tourStatus[artist.name];
      if (status?.events) {
        for (const event of status.events) {
          // Create unique key: artist + date (ignore venue differences for same day)
          const dateKey = event.date.split('T')[0]; // Use only date part
          const uniqueKey = `${artist.name}-${dateKey}`;

          // Only add if not already present (keeps first occurrence)
          if (!concertsMap.has(uniqueKey)) {
            concertsMap.set(uniqueKey, {
              ...event,
              artistName: artist.name,
              artistImage: artist.images[0]?.url,
            });
          }
        }
      }
    }
  }

  // Convert map to array and sort by date
  const allConcerts = Array.from(concertsMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Artists who are on tour
  const artistsOnTour = topArtists?.filter(
    (a) => tourStatus?.[a.name]?.onTour
  ) || [];

  const isLoading = artistsLoading || locationLoading || tourLoading;

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

      {/* Location Permission Banner */}
      {permissionDenied && (
        <ScrollReveal delay={0.1}>
          <ModernCard className="bg-[#EC4899]/5 border-[#EC4899]/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#EC4899]">
                {tTour('locationPermission')}
              </p>
              <ModernButton variant="secondary" size="sm" onClick={requestPermission}>
                Enable
              </ModernButton>
            </div>
          </ModernCard>
        </ScrollReveal>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-4 text-4xl"
          >
            ♪
          </motion.div>
          <p className="font-medium text-[#EC4899]">{tTour('searching')}</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Artists On Tour Section */}
          {artistsOnTour.length > 0 && (
            <ScrollReveal delay={0.2}>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                {t('tracking')} <span className="text-[#EC4899]">{artistsOnTour.length}</span> artists
              </h2>
              <div className="flex flex-wrap gap-3">
                {artistsOnTour.map((artist) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-full border border-[#EC4899]/30 bg-[#EC4899]/10 pl-1 pr-3 py-1"
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      {artist.images[0]?.url && (
                        <Image
                          src={artist.images[0].url}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-[#EC4899]">
                      {artist.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          )}

          {/* Empty State */}
          {allConcerts.length === 0 && (
            <ScrollReveal delay={0.2}>
              <ModernCard className="text-center py-16">
                <div className="mb-4 text-5xl opacity-30">🎤</div>
                <p className="text-lg font-medium text-muted-foreground">
                  {tTour('noUpcoming')}
                </p>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  {tTour('fromTopArtists')}
                </p>
              </ModernCard>
            </ScrollReveal>
          )}

          {/* Concerts Grid */}
          {allConcerts.length > 0 && (
            <ScrollReveal delay={0.3}>
              <div className="grid gap-4 md:grid-cols-2">
                {allConcerts.map((concert, index) => (
                  <motion.div
                    key={`${concert.artistName}-${concert.date}-${concert.venue}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <ModernCard hover className="h-full">
                      <div className="space-y-3">
                        {/* Artist Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {concert.artistImage && (
                              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#EC4899]/30">
                                <Image
                                  src={concert.artistImage}
                                  alt={concert.artistName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <h3 className="text-lg font-semibold text-[#EC4899]">
                              {concert.artistName}
                            </h3>
                          </div>
                          <OnTourBadge variant="badge" />
                        </div>

                        {/* Venue */}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {concert.venue}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {concert.city}
                          </p>
                        </div>

                        {/* Date and Distance */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-primary">
                              {new Date(concert.date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            {concert.distanceKm !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                {tTour('kmAway', { distance: concert.distanceKm })}
                              </p>
                            )}
                          </div>

                          {concert.ticketUrl && (
                            <a
                              href={concert.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ModernButton variant="secondary" size="sm">
                                {tTour('getTickets')}
                              </ModernButton>
                            </a>
                          )}
                        </div>
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          )}
        </>
      )}
      </div>
    </div>
  );
}
