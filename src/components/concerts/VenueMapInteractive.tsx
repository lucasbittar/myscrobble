'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useTranslations } from 'next-intl';
import type { Venue } from '@/types/venue';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface VenueMapInteractiveProps {
  userLocation?: { lat: number; lng: number } | null;
  venues: Venue[];
  selectedIndex: number | null;
  onVenueSelect: (index: number | null) => void;
}

// Venue type colors and icons (labels come from translations)
const venueConfig: Record<Venue['type'], { color: string; icon: string }> = {
  bar: {
    color: '#F59E0B',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM5.66 5h12.69l-1.78 2H7.43L5.66 5zM12 14.1L8.8 10h6.4L12 14.1z"/></svg>`,
  },
  club: {
    color: '#8B5CF6',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>`,
  },
  venue: {
    color: '#EC4899',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>`,
  },
  restaurant: {
    color: '#10B981',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>`,
  },
};

// Custom pulsing user marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker-interactive',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; inset: 0; background: #EC4899; border-radius: 50%; animation: userPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%); border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px rgba(236, 72, 153, 0.6), 0 4px 12px rgba(0,0,0,0.3);"></div>
        <div style="position: absolute; inset: 6px; background: white; border-radius: 50%;"></div>
      </div>
      <style>
        @keyframes userPing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom venue marker with type-specific icon
const createVenueIcon = (index: number, type: Venue['type'], isSelected: boolean) => {
  const config = venueConfig[type] || venueConfig.venue;
  const size = isSelected ? 52 : 44;
  const iconSize = isSelected ? 22 : 18;

  return L.divIcon({
    className: `venue-marker-${index}`,
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${isSelected ? `
          <div style="
            position: absolute;
            inset: -4px;
            background: ${config.color};
            border-radius: 50%;
            animation: markerPulse 1.5s ease-in-out infinite;
            opacity: 0.3;
          "></div>
        ` : ''}
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(145deg, ${config.color} 0%, ${config.color}dd 100%);
          border-radius: 50%;
          box-shadow: ${isSelected
            ? `0 0 30px ${config.color}80, 0 8px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)`
            : `0 4px 16px rgba(0,0,0,0.3), 0 0 12px ${config.color}40, inset 0 2px 4px rgba(255,255,255,0.2)`};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 3px solid rgba(255,255,255,0.9);
        ">
          <div style="width: ${iconSize}px; height: ${iconSize}px; display: flex; align-items: center; justify-content: center;">
            ${config.icon}
          </div>
        </div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.75);
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          backdrop-filter: blur(4px);
          letter-spacing: 0.5px;
        ">${index + 1}</div>
      </div>
      <style>
        @keyframes markerPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.15; }
        }
      </style>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 8],
  });
};

// Component to handle map interactions and fly to selected venue
function MapController({
  venues,
  selectedIndex,
  userLocation,
}: {
  venues: Venue[];
  selectedIndex: number | null;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const initialFitDone = useRef(false);

  // Fit bounds to show all venues on initial load
  useEffect(() => {
    if (initialFitDone.current) return;
    if (venues.length === 0 && !userLocation) return;

    const points: [number, number][] = [];

    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    venues.forEach((venue) => {
      if (venue.latitude && venue.longitude) {
        points.push([venue.latitude, venue.longitude]);
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      initialFitDone.current = true;
    }
  }, [venues, userLocation, map]);

  // Fly to selected venue
  useEffect(() => {
    if (selectedIndex === null) return;
    const venue = venues[selectedIndex];
    if (!venue || !venue.latitude || !venue.longitude) return;

    map.flyTo([venue.latitude, venue.longitude], 16, {
      duration: 0.8,
    });
  }, [selectedIndex, venues, map]);

  return null;
}

export default function VenueMapInteractive({
  userLocation,
  venues,
  selectedIndex,
  onVenueSelect,
}: VenueMapInteractiveProps) {
  const t = useTranslations('concerts');

  // Memoize user icon
  const userIcon = useMemo(() => createUserIcon(), []);

  // Calculate initial center
  const center = useMemo<[number, number]>(() => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    if (venues.length > 0) {
      return [venues[0].latitude, venues[0].longitude];
    }
    return [40.7128, -74.006]; // New York fallback
  }, [userLocation, venues]);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full"
        style={{ background: '#f8f9fa' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Custom positioned zoom control */}
        <ZoomControl position="bottomright" />

        {/* Map controller for interactions */}
        <MapController
          venues={venues}
          selectedIndex={selectedIndex}
          userLocation={userLocation}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center py-2 px-3">
                <p className="font-semibold text-sm text-gray-900">{t('youAreHere')}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Venue Markers */}
        {venues.map((venue, index) => {
          if (!venue.latitude || !venue.longitude) return null;

          const isSelected = selectedIndex === index;
          const config = venueConfig[venue.type];

          return (
            <Marker
              key={`venue-${venue.name}-${index}`}
              position={[venue.latitude, venue.longitude]}
              icon={createVenueIcon(index, venue.type, isSelected)}
              eventHandlers={{
                click: () => onVenueSelect(isSelected ? null : index),
              }}
              zIndexOffset={isSelected ? 1000 : index}
            >
              <Popup>
                <div className="min-w-[220px] max-w-[300px] p-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`,
                        boxShadow: `0 4px 12px ${config.color}40`
                      }}
                      dangerouslySetInnerHTML={{ __html: config.icon }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 leading-tight mb-0.5">
                        {venue.name}
                      </p>
                      <p
                        className="text-xs font-medium"
                        style={{ color: config.color }}
                      >
                        {t(`venueTypes.${venue.type}`)}
                      </p>
                    </div>
                  </div>

                  {venue.address && (
                    <p className="text-xs text-gray-500 mb-2 flex items-start gap-1.5">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {venue.address}
                    </p>
                  )}

                  {venue.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {venue.description}
                    </p>
                  )}

                  {venue.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {venue.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: `${config.color}15`,
                            color: config.color,
                          }}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {venue.distanceKm !== undefined && (
                      <span className="text-xs text-gray-500 font-medium">
                        {t('kmAway', { distance: venue.distanceKm })}
                      </span>
                    )}
                    {venue.website && (
                      <a
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold hover:underline flex items-center gap-1"
                        style={{ color: config.color }}
                      >
                        {t('website')}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Soft edge fade - light mode */}
      <div
        className="absolute inset-0 pointer-events-none z-[500] dark:hidden" />
      {/* Soft edge fade - dark mode */}
      <div
        className="absolute inset-0 pointer-events-none z-[500] hidden dark:block"
        style={{
          background: `
            linear-gradient(to bottom, rgba(10,10,10,0.9) 0%, transparent 8%, transparent 92%, rgba(10,10,10,0.95) 100%),
            linear-gradient(to right, rgba(10,10,10,0.7) 0%, transparent 5%, transparent 95%, rgba(10,10,10,0.7) 100%)
          `
        }}
      />

      {/* Compact Legend - bottom right corner */}
      <div className="absolute bottom-20 right-4 z-[1000]">
        <div className="flex flex-col gap-1.5 bg-white/85 dark:bg-black/75 backdrop-blur-xl rounded-xl p-3 border border-white/30 dark:border-white/10 shadow-lg">
          {(Object.keys(venueConfig) as Venue['type'][]).map((key) => (
            <div key={key} className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm"
                style={{
                  backgroundColor: venueConfig[key].color,
                  boxShadow: `0 2px 8px ${venueConfig[key].color}30`
                }}
                dangerouslySetInnerHTML={{ __html: venueConfig[key].icon.replace('width="18"', 'width="12"').replace('height="18"', 'height="12"') }}
              />
              <span className="text-xs text-foreground/80 font-medium">{t(`venueTypes.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
