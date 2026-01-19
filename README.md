# MyScrobble

A modern Spotify dashboard with AI-powered recommendations, listening statistics, and social sharing features. Built with Next.js 14, featuring a retro CRT terminal aesthetic.

## Features

### Dashboard
- **Now Playing** - Real-time display of your currently playing track
- **Recent Tracks** - Your latest listening activity from Spotify
- **Top Artists & Tracks** - View your favorites across different time ranges (4 weeks, 6 months, all time)

### Listening History
- **Sync to Database** - Store your listening history in Supabase for long-term tracking
- **Date Filtering** - Filter history by today, this week, this month, or all time
- **Pagination** - Browse through your complete listening history

### AI Discover
- **Gemini AI Recommendations** - Get personalized artist recommendations based on your listening habits
- **Smart Analysis** - AI analyzes your top artists and genres to suggest new music
- **Spotify Integration** - Each recommendation includes artist images and direct Spotify links
- **Cached Results** - Recommendations are cached for 24 hours to reduce API calls

### Your Wrapped
- **Custom Time Ranges** - Create your own "Wrapped" experience for any time period
- **Interactive Slides** - Carousel presentation of your top artists, tracks, and genres
- **Listening Patterns** - Visualize when you listen most (by hour and day of week)
- **Detailed Stats** - Total listening time, tracks played, unique artists and tracks

### Social Sharing
- **Instagram Story Format** - Generate shareable cards optimized for Instagram Stories (1080x1920)
- **Multiple Templates** - Choose from Top Artist, Top 5 Artists, Top Track, or Stats card
- **Download as PNG** - Save cards directly to your device
- **CRT Aesthetic** - Cards feature the signature retro terminal look

### Concerts (Coming Soon)
- Discover upcoming concerts for your favorite artists
- Filter by location
- Direct links to tickets

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Custom Spotify OAuth 2.0 |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS |
| UI Components | Custom CRT-themed components |
| Animations | Framer Motion |
| State | TanStack Query |
| AI | Google Gemini API |
| Image Generation | html2canvas |

## Getting Started

### Prerequisites

- Node.js 18+
- Spotify Developer Account
- Supabase Account
- Google AI Studio Account (for Gemini API)

### Environment Variables

Create a `.env` file with the following variables:

```env
# Spotify OAuth
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App URL (for OAuth callback)
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://127.0.0.1:3000/api/auth/callback/spotify` to Redirect URIs
4. Copy your Client ID and Client Secret

### Supabase Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listening history table
CREATE TABLE listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_art_url TEXT,
  played_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, track_id, played_at)
);

-- Recommendations cache table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_played_at ON listening_history(played_at DESC);
CREATE INDEX idx_recommendations_user_expires ON recommendations(user_id, expires_at);
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) with your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Custom OAuth endpoints
│   │   ├── ai/             # Gemini AI recommendations
│   │   ├── history/        # Listening history queries
│   │   ├── spotify/        # Spotify API proxies
│   │   ├── stats/          # Statistics aggregation
│   │   └── sync/           # History sync to Supabase
│   ├── auth/               # Login page
│   └── dashboard/          # Main dashboard pages
│       ├── concerts/
│       ├── discover/
│       ├── history/
│       ├── share/
│       ├── top/
│       └── wrapped/
├── components/
│   └── crt/                # CRT-themed UI components
└── lib/
    ├── session.ts          # Session management
    ├── spotify.ts          # Spotify API client
    └── supabase/           # Supabase clients
```

## Design

The app features a retro CRT terminal aesthetic with:

- **Phosphor Green** (#00ff41) - Primary accent color
- **Cyan** (#00f5ff) - Secondary accent for links and highlights
- **Magenta** (#ff00ff) - Tertiary accent for badges and emphasis
- **Amber** (#ffb000) - Warning and Wrapped theme color
- **Scanline Effects** - Subtle CRT scanline overlay
- **Glow Effects** - Phosphor glow on text and borders
- **Terminal Fonts** - Monospace typography throughout

## License

MIT
