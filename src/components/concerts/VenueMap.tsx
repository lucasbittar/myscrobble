'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import type { Venue } from '@/types/venue';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface VenueMapProps {
  userLocation?: { lat: number; lng: number } | null;
  venues: Venue[];
  onVenueClick?: (venue: Venue) => void;
}

// Custom pulsing user marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div class="relative">
        <div class="absolute w-6 h-6 bg-[#EC4899] rounded-full animate-ping opacity-50"></div>
        <div class="relative w-6 h-6 bg-[#EC4899] rounded-full border-3 border-white shadow-xl shadow-[#EC4899]/40"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom venue marker with better visibility
const createVenueIcon = (type: Venue['type']) => {
  const colors = {
    bar: '#F59E0B',
    club: '#8B5CF6',
    venue: '#EC4899',
    restaurant: '#10B981',
  };
  const color = colors[type] || colors.venue;

  return L.divIcon({
    className: 'venue-marker',
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xl" style="box-shadow: 0 4px 20px rgba(0,0,0,0.2), 0 0 0 3px ${color};">
        <svg class="w-5 h-5" style="color: ${color}" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Component to recenter map when user location changes
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function VenueMap({
  userLocation,
  venues,
  onVenueClick,
}: VenueMapProps) {
  // Memoize icons
  const userIcon = useMemo(() => createUserIcon(), []);

  // Calculate center
  const center = useMemo<[number, number]>(() => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    // Default to first venue or New York
    if (venues.length > 0) {
      return [venues[0].latitude, venues[0].longitude];
    }
    return [40.7128, -74.006]; // New York
  }, [userLocation, venues]);

  return (
    <div className="relative w-full h-full min-h-[700px] md:min-h-[800px]">
      {/* Top fade - softer gradient for content overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none z-10 hidden dark:block"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, rgba(10,10,10,0) 100%)',
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-10 hidden dark:block"
        style={{
          background: 'linear-gradient(to top, rgb(10,10,10) 0%, rgba(10,10,10,0.9) 30%, rgba(10,10,10,0) 100%)',
        }}
      />

      {/* Left fade */}
      <div
        className="absolute top-0 bottom-0 left-0 w-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div
        className="absolute top-0 bottom-0 left-0 w-32 pointer-events-none z-10 hidden dark:block"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0) 100%)',
        }}
      />

      {/* Right fade */}
      <div
        className="absolute top-0 bottom-0 right-0 w-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to left, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-32 pointer-events-none z-10 hidden dark:block"
        style={{
          background: 'linear-gradient(to left, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0) 100%)',
        }}
      />

      {/* Map */}
      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full"
        style={{ background: '#f0f0f0' }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          className="dark:invert dark:hue-rotate-180 dark:brightness-95 dark:contrast-90"
        />

        <MapCenterUpdater center={center} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center font-semibold text-sm py-1">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Venue Markers */}
        {venues.map((venue, index) => (
          <Marker
            key={`venue-${venue.name}-${index}`}
            position={[venue.latitude, venue.longitude]}
            icon={createVenueIcon(venue.type)}
            eventHandlers={{
              click: () => onVenueClick?.(venue),
            }}
          >
            <Popup>
              <div className="min-w-[220px] p-1">
                <p className="font-bold text-foreground mb-1 text-base">{venue.name}</p>
                <p className="text-sm text-muted-foreground mb-3">{venue.address}</p>
                {venue.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {venue.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-0.5 rounded-full bg-[#EC4899]/10 text-[#EC4899] text-xs font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {venue.distanceKm !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {venue.distanceKm}km away
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading overlay placeholder for when map is loading */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center pointer-events-none"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full border-2 border-[#EC4899] border-t-transparent mx-auto mb-2"
          />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </motion.div>
    </div>
  );
}

export default VenueMap;
