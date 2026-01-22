// Share card types based on context
export type ShareCardType =
  | 'dashboard'
  | 'history'
  | 'top-charts'
  | 'concerts'
  | 'sonic-aura'
  | 'podcasts';

// Color gradients by context
export type ShareColorTheme = 'green' | 'purple' | 'pink' | 'teal' | 'dynamic';

export const shareColorThemes: Record<ShareColorTheme, { from: string; to: string; glow: string }> = {
  green: {
    from: '#1DB954',
    to: '#14B8A6',
    glow: 'rgba(29, 185, 84, 0.4)',
  },
  purple: {
    from: '#8B5CF6',
    to: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  pink: {
    from: '#EC4899',
    to: '#8B5CF6',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  teal: {
    from: '#14B8A6',
    to: '#8B5CF6',
    glow: 'rgba(20, 184, 166, 0.4)',
  },
  dynamic: {
    from: '#8B5CF6',
    to: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
};

// Map card types to color themes
export const cardTypeToTheme: Record<ShareCardType, ShareColorTheme> = {
  'dashboard': 'green',
  'history': 'green',
  'top-charts': 'purple',
  'concerts': 'pink',
  'sonic-aura': 'dynamic',
  'podcasts': 'teal',
};

// Data types for each card
export interface DashboardShareData {
  nowPlaying?: {
    trackName: string;
    artistName: string;
    albumImage: string;
  };
  stats?: {
    totalMinutes: number;
    totalTracks: number;
    uniqueArtists: number;
  };
}

export interface HistoryShareData {
  recentTracks: Array<{
    trackName: string;
    artistName: string;
    albumImage: string;
  }>;
}

export interface TopChartsShareData {
  type: 'artists' | 'tracks' | 'albums';
  timeRange: string;
  items: Array<{
    name: string;
    subtitle?: string;
    image: string;
  }>;
}

export interface ConcertsShareData {
  nextConcert?: {
    artistName: string;
    artistImage?: string;
    venue: string;
    city: string;
    date: string;
    daysUntil: number;
  };
  upcomingCount: number;
}

export interface SonicAuraShareData {
  moodSentence: string;
  moodTags: string[];
  moodColor: 'energetic' | 'chill' | 'melancholic' | 'nostalgic' | 'experimental';
  emoji?: string;
}

export interface PodcastsShareData {
  featuredShow?: {
    name: string;
    publisher: string;
    image: string;
    episodeCount: number;
  };
  totalShows: number;
  totalEpisodes: number;
}

export type ShareData =
  | { type: 'dashboard'; data: DashboardShareData }
  | { type: 'history'; data: HistoryShareData }
  | { type: 'top-charts'; data: TopChartsShareData }
  | { type: 'concerts'; data: ConcertsShareData }
  | { type: 'sonic-aura'; data: SonicAuraShareData }
  | { type: 'podcasts'; data: PodcastsShareData };
