export interface TourEvent {
  date: string; // ISO date format YYYY-MM-DD
  venue: string;
  city: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  ticketUrl?: string;
}

export interface TourStatusResponse {
  onTour: boolean;
  events: TourEvent[];
}

export interface BatchTourStatusResponse {
  [artistName: string]: TourStatusResponse;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface TourStatusParams {
  artistName: string;
  lat?: number;
  lng?: number;
}

export interface BatchTourStatusParams {
  artists: string[];
  lat?: number;
  lng?: number;
}
