const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
  preview_url: string | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; width: number; height: number }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
  followers: { total: number };
}

export interface PlayedTrack {
  track: SpotifyTrack;
  played_at: string;
}

export interface CurrentlyPlaying {
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
  timestamp: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; width: number; height: number }[];
  country: string;
  product: string;
  followers: { total: number };
  external_urls: { spotify: string };
}

class SpotifyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Spotify API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.fetch<SpotifyUser>('/me');
  }

  async getCurrentlyPlaying(): Promise<CurrentlyPlaying | null> {
    try {
      const data = await this.fetch<CurrentlyPlaying>('/me/player/currently-playing');
      return data;
    } catch {
      return null;
    }
  }

  async getRecentlyPlayed(limit = 50): Promise<{ items: PlayedTrack[] }> {
    return this.fetch<{ items: PlayedTrack[] }>(
      `/me/player/recently-played?limit=${limit}`
    );
  }

  async getTopArtists(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit = 20
  ): Promise<{ items: SpotifyArtist[] }> {
    return this.fetch<{ items: SpotifyArtist[] }>(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
  }

  async getTopTracks(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit = 20
  ): Promise<{ items: SpotifyTrack[] }> {
    return this.fetch<{ items: SpotifyTrack[] }>(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
  }

  async getSavedTracks(limit = 50, offset = 0): Promise<{
    items: { added_at: string; track: SpotifyTrack }[];
    total: number;
    next: string | null;
  }> {
    return this.fetch(
      `/me/tracks?limit=${limit}&offset=${offset}`
    );
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    return this.fetch<SpotifyArtist>(`/artists/${artistId}`);
  }

  async getArtistTopTracks(artistId: string, market = 'US'): Promise<{ tracks: SpotifyTrack[] }> {
    return this.fetch<{ tracks: SpotifyTrack[] }>(
      `/artists/${artistId}/top-tracks?market=${market}`
    );
  }

  async getRelatedArtists(artistId: string): Promise<{ artists: SpotifyArtist[] }> {
    return this.fetch<{ artists: SpotifyArtist[] }>(
      `/artists/${artistId}/related-artists`
    );
  }

  async searchArtists(query: string, limit = 1): Promise<{ artists: { items: SpotifyArtist[] } }> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetch<{ artists: { items: SpotifyArtist[] } }>(
      `/search?q=${encodedQuery}&type=artist&limit=${limit}`
    );
  }
}

export function createSpotifyClient(accessToken: string): SpotifyClient {
  return new SpotifyClient(accessToken);
}
