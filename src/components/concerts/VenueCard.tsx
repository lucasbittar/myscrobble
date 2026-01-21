'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Venue } from '@/types/venue';
import { gridItemVariants } from '@/lib/animations';

interface VenueCardProps {
  venue: Venue;
  onClick?: () => void;
}

const venueTypeIcons: Record<Venue['type'], React.ReactNode> = {
  bar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  club: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  ),
  venue: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  restaurant: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
};

const venueTypeColors: Record<Venue['type'], string> = {
  bar: '#F59E0B',
  club: '#8B5CF6',
  venue: '#EC4899',
  restaurant: '#10B981',
};

export function VenueCard({ venue, onClick }: VenueCardProps) {
  const t = useTranslations('concerts');
  const color = venueTypeColors[venue.type];

  return (
    <motion.div variants={gridItemVariants} className="group" onClick={onClick}>
      <div className="h-full p-5 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-sm border border-transparent hover:border-[#EC4899]/30 hover:bg-white/90 dark:hover:bg-white/15 hover:shadow-lg transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Venue Type Icon */}
          <div
            className="flex w-12 h-12 flex-shrink-0 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: `${color}15` }}
          >
            <span style={{ color }}>{venueTypeIcons[venue.type]}</span>
          </div>

          {/* Name and Type */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-foreground group-hover:text-[#EC4899] transition-colors truncate">
              {venue.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${color}15`, color }}
              >
                {t(`venueTypes.${venue.type}`)}
              </span>
            </p>
          </div>

          {/* Distance Badge */}
          {venue.distanceKm !== undefined && (
            <div className="flex-shrink-0 px-3 py-1 rounded-full bg-[#EC4899]/10 text-[#EC4899] text-xs font-semibold">
              {venue.distanceKm}km
            </div>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{venue.address}</p>

        {/* Description */}
        {venue.description && (
          <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{venue.description}</p>
        )}

        {/* Genres */}
        {venue.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {venue.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 rounded-md bg-white/50 dark:bg-white/5 text-xs text-foreground"
              >
                {genre}
              </span>
            ))}
            {venue.genres.length > 3 && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                +{venue.genres.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button className="flex items-center gap-1.5 text-sm font-medium text-[#EC4899] hover:underline">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {t('viewOnMap')}
          </button>

          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default VenueCard;
