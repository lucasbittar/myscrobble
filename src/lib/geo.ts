import haversineDistance from "haversine-distance";
import type { TourEvent, GeoLocation } from "@/types/tour";

// Default radius for filtering events (in kilometers)
export const DEFAULT_RADIUS_KM = 200;

// Known cities with coordinates for reverse geocoding
interface KnownCity {
  name: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}

const KNOWN_CITIES: KnownCity[] = [
  // Brazil
  { name: "São Paulo", region: "SP", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro", region: "RJ", country: "Brazil", lat: -22.9068, lng: -43.1729 },
  { name: "Belo Horizonte", region: "MG", country: "Brazil", lat: -19.9167, lng: -43.9345 },
  { name: "Curitiba", region: "PR", country: "Brazil", lat: -25.4284, lng: -49.2733 },
  { name: "Porto Alegre", region: "RS", country: "Brazil", lat: -30.0346, lng: -51.2177 },
  { name: "Brasília", region: "DF", country: "Brazil", lat: -15.7975, lng: -47.8919 },
  { name: "Salvador", region: "BA", country: "Brazil", lat: -12.9714, lng: -38.5014 },
  { name: "Recife", region: "PE", country: "Brazil", lat: -8.0476, lng: -34.877 },
  { name: "Fortaleza", region: "CE", country: "Brazil", lat: -3.7172, lng: -38.5433 },

  // USA
  { name: "New York", region: "NY", country: "USA", lat: 40.7128, lng: -74.006 },
  { name: "Los Angeles", region: "CA", country: "USA", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", region: "IL", country: "USA", lat: 41.8781, lng: -87.6298 },
  { name: "Houston", region: "TX", country: "USA", lat: 29.7604, lng: -95.3698 },
  { name: "Phoenix", region: "AZ", country: "USA", lat: 33.4484, lng: -112.074 },
  { name: "Philadelphia", region: "PA", country: "USA", lat: 39.9526, lng: -75.1652 },
  { name: "San Antonio", region: "TX", country: "USA", lat: 29.4241, lng: -98.4936 },
  { name: "San Diego", region: "CA", country: "USA", lat: 32.7157, lng: -117.1611 },
  { name: "Dallas", region: "TX", country: "USA", lat: 32.7767, lng: -96.797 },
  { name: "San Francisco", region: "CA", country: "USA", lat: 37.7749, lng: -122.4194 },
  { name: "Austin", region: "TX", country: "USA", lat: 30.2672, lng: -97.7431 },
  { name: "Seattle", region: "WA", country: "USA", lat: 47.6062, lng: -122.3321 },
  { name: "Denver", region: "CO", country: "USA", lat: 39.7392, lng: -104.9903 },
  { name: "Boston", region: "MA", country: "USA", lat: 42.3601, lng: -71.0589 },
  { name: "Atlanta", region: "GA", country: "USA", lat: 33.749, lng: -84.388 },
  { name: "Miami", region: "FL", country: "USA", lat: 25.7617, lng: -80.1918 },
  { name: "Nashville", region: "TN", country: "USA", lat: 36.1627, lng: -86.7816 },
  { name: "Portland", region: "OR", country: "USA", lat: 45.5152, lng: -122.6784 },
  { name: "Las Vegas", region: "NV", country: "USA", lat: 36.1699, lng: -115.1398 },

  // Europe
  { name: "London", region: "England", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", region: "Île-de-France", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", region: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { name: "Madrid", region: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { name: "Barcelona", region: "Catalonia", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { name: "Amsterdam", region: "North Holland", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "Lisbon", region: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393 },
];

// Default locations based on locale
export const DEFAULT_LOCATIONS: Record<string, GeoLocation> = {
  "pt-BR": { lat: -23.5505, lng: -46.6333 }, // São Paulo, Brazil
  en: { lat: 40.7128, lng: -74.006 }, // New York, USA
};

export function getDefaultLocation(locale?: string): GeoLocation {
  return DEFAULT_LOCATIONS[locale || "en"] || DEFAULT_LOCATIONS.en;
}

/**
 * Find the closest known city to given coordinates
 */
export function getClosestCity(lat: number, lng: number): KnownCity {
  let closestCity = KNOWN_CITIES[0];
  let minDistance = Infinity;

  for (const city of KNOWN_CITIES) {
    const distance = haversineDistance(
      { latitude: lat, longitude: lng },
      { latitude: city.lat, longitude: city.lng }
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }

  return closestCity;
}

/**
 * Get a location string for use in search prompts
 */
export function getLocationForSearch(lat: number, lng: number): string {
  const city = getClosestCity(lat, lng);
  return `${city.name}, ${city.region}, ${city.country}`;
}

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistanceKm(
  point1: GeoLocation,
  point2: GeoLocation
): number {
  const a = { latitude: point1.lat, longitude: point1.lng };
  const b = { latitude: point2.lat, longitude: point2.lng };
  const distanceMeters = haversineDistance(a, b);
  return Math.round(distanceMeters / 1000);
}

/**
 * Filter events by distance from user location
 * Returns events within the specified radius, sorted by distance
 */
export function filterEventsByDistance(
  events: TourEvent[],
  userLocation: GeoLocation,
  radiusKm: number = DEFAULT_RADIUS_KM
): TourEvent[] {
  const eventsWithDistance = events
    .filter((event) => event.latitude !== undefined && event.longitude !== undefined)
    .map((event) => {
      const distanceKm = calculateDistanceKm(userLocation, {
        lat: event.latitude!,
        lng: event.longitude!,
      });
      return { ...event, distanceKm };
    })
    .filter((event) => event.distanceKm <= radiusKm)
    .sort((a, b) => {
      // Sort by date first, then by distance
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    });

  return eventsWithDistance;
}

/**
 * Get location name for display based on coordinates
 */
export function getLocationName(locale?: string): string {
  if (locale === "pt-BR") {
    return "São Paulo, Brazil";
  }
  return "New York, USA";
}
