export type VenueType = 'bar' | 'club' | 'venue' | 'restaurant';

export interface Venue {
  name: string;
  address: string;
  city: string;
  genres: string[];
  description: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  website?: string;
  type: VenueType;
}

export interface VenueResponse {
  venues: Venue[];
  basedOnGenres: string[];
  generatedAt: string;
  cached: boolean;
  detectedCity?: string | null;
}
