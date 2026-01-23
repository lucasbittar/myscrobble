'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useTourStatusBatch } from '@/hooks/useTourStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useTranslations } from 'next-intl';
import type { TourEvent } from '@/types/tour';
import type { VenueResponse, Venue } from '@/types/venue';
import { PageHeader, ModernButton } from '@/components/modern';
import { ConcertHero, ConcertTimeline } from '@/components/concerts';
import { containerVariants, gridItemVariants } from '@/lib/animations';
import { ShareProvider, ShareModal, FloatingShareButton, type ConcertsShareData, type ShareData } from '@/components/share';

// Dynamically import the map component to avoid SSR issues with Leaflet
const VenueMapInteractive = dynamic(
  () => import('@/components/concerts/VenueMapInteractive'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-900 dark:to-neutral-800 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full border-2 border-[#EC4899] border-t-transparent mx-auto mb-3"
          />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
);

interface TopArtist {
  id: string;
  name: string;
  images: { url: string }[];
  genres?: string[];
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

async function fetchVenues(
  lat: number,
  lng: number,
  genres: string[]
): Promise<VenueResponse> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    genres: genres.join(','),
  });
  const res = await fetch(`/api/ai/venues?${params}`);
  if (!res.ok) {
    return { venues: [], basedOnGenres: [], generatedAt: '', cached: false };
  }
  return res.json();
}

// Venue type styling (labels come from translations)
const venueTypeConfig: Record<Venue['type'], { color: string; icon: string }> = {
  bar: { color: '#F59E0B', icon: '🍺' },
  club: { color: '#8B5CF6', icon: '🎧' },
  venue: { color: '#EC4899', icon: '🎤' },
  restaurant: { color: '#10B981', icon: '🍽️' },
};

export default function ConcertsPage() {
  const t = useTranslations('concerts');
  const tTour = useTranslations('tour');

  // State for selected venue
  const [selectedVenueIndex, setSelectedVenueIndex] = useState<number | null>(null);

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

  // Extract genres from top artists
  const topGenres = useMemo(() => {
    if (!topArtists) return [];
    const genreCount: Record<string, number> = {};
    for (const artist of topArtists) {
      for (const genre of artist.genres || []) {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      }
    }
    return Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);
  }, [topArtists]);

  // Fetch nearby venues
  const { data: venueData, isLoading: venuesLoading } = useQuery({
    queryKey: ['venues', location?.lat, location?.lng, topGenres],
    queryFn: () => fetchVenues(location!.lat, location!.lng, topGenres),
    enabled: !!location && topGenres.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Combine all concerts from all artists and deduplicate
  const concertsMap = new Map<string, ConcertWithArtist>();
  if (tourStatus && topArtists) {
    for (const artist of topArtists) {
      const status = tourStatus[artist.name];
      if (status?.events) {
        for (const event of status.events) {
          const dateKey = event.date.split('T')[0];
          const uniqueKey = `${artist.name}-${dateKey}`;

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

  const nextConcert = allConcerts[0];
  const remainingConcerts = allConcerts.slice(1);

  // Artists who are on tour
  const artistsOnTour = topArtists?.filter(
    (a) => tourStatus?.[a.name]?.onTour
  ) || [];

  const isLoading = artistsLoading || locationLoading || tourLoading;
  const venues = venueData?.venues || [];
  const detectedCity = venueData?.detectedCity;

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

  return (
    <ShareProvider userName={userName}>
      <>
        <div className="relative z-10 min-h-screen">
      {/* Section 1: Concerts */}
      <div className="py-8 md:py-24 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
            subtitle={t('subtitle')}
            title={t('title')}
            rightContent={
              <div className="flex items-center gap-4">
                {/* Share Button */}
                {nextConcert && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FloatingShareButton
                      shareData={{
                        type: 'concerts',
                        data: {
                          nextConcert: {
                            artistName: nextConcert.artistName,
                            artistImage: nextConcert.artistImage,
                            venue: nextConcert.venue,
                            city: nextConcert.city,
                            date: nextConcert.date,
                            daysUntil: Math.ceil((new Date(nextConcert.date).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)),
                          },
                          upcomingCount: allConcerts.length,
                        } as ConcertsShareData,
                      } as ShareData}
                      theme="pink"
                      position="relative"
                      size="lg"
                      showLabel
                      mobileFixed
                    />
                  </motion.div>
                )}

                {/* Artists on Tour */}
                {artistsOnTour.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    {artistsOnTour.slice(0, 5).map((artist) => (
                      <motion.div
                        key={artist.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 rounded-full border border-white/30 dark:border-white/20 bg-white/70 dark:bg-white/10 backdrop-blur-md pl-1 pr-3 py-1 shadow-sm"
                      >
                        <div className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-[#EC4899]/30">
                          {artist.images[0]?.url && (
                            <Image
                              src={artist.images[0].url}
                              alt={artist.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {artist.name}
                        </span>
                      </motion.div>
                    ))}
                    {artistsOnTour.length > 5 && (
                      <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm">
                        +{artistsOnTour.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            }
          />

          {/* Location Permission Banner */}
          {permissionDenied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-2xl bg-[#EC4899]/5 border border-[#EC4899]/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EC4899]/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#EC4899]"
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
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tTour('locationHint')}</p>
                  </div>
                </div>
                <ModernButton variant="secondary" size="sm" onClick={requestPermission}>
                  {tTour('enableLocation')}
                </ModernButton>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Loading State */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border-2 border-[#EC4899] border-t-transparent mb-4"
                />
                <p className="text-lg font-medium text-[#EC4899]">
                  {tTour('searching')}
                </p>
              </motion.div>
            )}

            {/* Content */}
            {!isLoading && (
              <motion.div
                key="content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Hero: Next Concert */}
                {nextConcert && <ConcertHero concert={nextConcert} />}

                {/* Timeline: Upcoming Shows */}
                {remainingConcerts.length > 0 && (
                  <ConcertTimeline concerts={remainingConcerts} />
                )}

                {/* Empty State: No concerts */}
                {allConcerts.length === 0 && (
                  <motion.div
                    variants={gridItemVariants}
                    className="py-20 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-8xl mb-6 opacity-80"
                    >
                      🎤
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      {tTour('noUpcoming')}
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {tTour('fromTopArtists')}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Section 2: Discover Nearby - Full-width Map with Floating Panel */}
      {!isLoading && location && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative border-t border-border"
        >
          {/* Section Header */}
          <div className="px-4 md:px-12 py-6 md:py-8 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-b border-white/20 dark:border-white/10">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs font-semibold tracking-[1.5px] text-[#EC4899] uppercase mb-2">
                  {t('discoverNearby')}
                </p>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                      {detectedCity ? t('liveMusicIn', { city: detectedCity }) : t('liveMusic')}
                    </h2>
                    {topGenres.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('basedOnTaste')}: <span className="text-foreground font-medium">{topGenres.slice(0, 3).join(', ')}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
                      {t('venuesFound', { count: venues.length })}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Full-width Map Container */}
          <div className="relative h-[600px] md:h-[750px]">
            <VenueMapInteractive
              userLocation={location}
              venues={venues}
              selectedIndex={selectedVenueIndex}
              onVenueSelect={setSelectedVenueIndex}
            />

            {/* Floating Venue Panel - aligned to page content */}
            <div className="absolute inset-0 pointer-events-none z-[600]">
              <div className="h-full max-w-7xl mx-auto px-4 md:px-12 py-4 md:py-6 flex items-start">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pointer-events-auto max-w-sm w-full"
                >
                  <div className="max-h-[540px] md:max-h-[690px] bg-white/85 dark:bg-black/75 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 dark:border-white/10 overflow-hidden flex flex-col">
                    {/* Panel Header */}
                    <div className="px-5 py-3 border-b border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {t('venues')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t('clickToExplore')}
                        </span>
                      </div>
                    </div>

                    {/* Venue List */}
                    <div className="flex-1 overflow-y-auto">
                      {/* Venues Loading */}
                      {venuesLoading && (
                        <div className="flex items-center justify-center py-16">
                          <div className="text-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-8 h-8 rounded-full border-2 border-[#EC4899] border-t-transparent mx-auto mb-3"
                            />
                            <p className="text-sm text-muted-foreground">{t('findingVenues')}</p>
                          </div>
                        </div>
                      )}

                      {/* Venue List Items */}
                      {!venuesLoading && venues.length > 0 && (
                        <div>
                          {venues.map((venue, index) => (
                            <VenueListItem
                              key={`${venue.name}-${index}`}
                              venue={venue}
                              index={index}
                              isSelected={selectedVenueIndex === index}
                              onClick={() => setSelectedVenueIndex(selectedVenueIndex === index ? null : index)}
                              t={t}
                            />
                          ))}
                        </div>
                      )}

                      {/* No venues */}
                      {!venuesLoading && venues.length === 0 && (
                        <div className="flex items-center justify-center py-16 px-6">
                          <div className="text-center">
                            <p className="text-4xl mb-4">🎵</p>
                            <p className="font-medium text-foreground mb-2">{t('noVenues')}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('noVenuesDescription')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

        {/* Share Modal */}
        <ShareModal />
      </div>
      </>
    </ShareProvider>
  );
}

// Venue list item component for the floating panel
function VenueListItem({
  venue,
  index,
  isSelected,
  onClick,
  t,
}: {
  venue: Venue;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, values?: any) => string;
}) {
  const config = venueTypeConfig[venue.type];
  const label = t(`venueTypes.${venue.type}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={onClick}
      className={`
        px-4 py-3 cursor-pointer transition-all duration-200 border-b border-black/5 dark:border-white/5 last:border-b-0
        ${isSelected
          ? 'bg-gradient-to-r from-[#EC4899]/15 to-transparent'
          : 'hover:bg-black/5 dark:hover:bg-white/5'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Venue Type Icon */}
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all
            ${isSelected ? 'shadow-lg scale-105' : ''}
          `}
          style={{
            background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`,
            boxShadow: isSelected ? `0 4px 16px ${config.color}50` : `0 2px 8px ${config.color}30`
          }}
        >
          <span className="text-lg">{config.icon}</span>
        </div>

        {/* Venue Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-muted-foreground/70 tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-[#EC4899]' : 'text-foreground'}`}>
              {venue.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="font-medium"
              style={{ color: config.color }}
            >
              {label}
            </span>
            {venue.distanceKm !== undefined && (
              <>
                <span className="opacity-40">•</span>
                <span>{venue.distanceKm}km</span>
              </>
            )}
            {venue.genres.length > 0 && (
              <>
                <span className="opacity-40">•</span>
                <span className="truncate">{venue.genres[0]}</span>
              </>
            )}
          </div>
        </div>

        {/* Arrow indicator */}
        <motion.div
          animate={{ x: isSelected ? 0 : -4, opacity: isSelected ? 1 : 0.3 }}
          className="text-[#EC4899]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
