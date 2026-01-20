# Technical Documentation

This document covers the technical setup, architecture, and configuration for MyScrobble.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [External Services Setup](#external-services-setup)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Key Components](#key-components)
- [Development](#development)

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
| Geolocation | haversine-distance |
| i18n | next-intl |

## Prerequisites

- Node.js 18+
- npm or yarn
- Spotify Developer Account
- Supabase Account
- Google AI Studio Account (for Gemini API)

## Environment Variables

Create a `.env` file in the project root:

```env
# Spotify OAuth
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# NextAuth (generate a random secret)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://127.0.0.1:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App URL (for OAuth callback)
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

## External Services Setup

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add the following Redirect URIs:
   - `http://127.0.0.1:3000/api/auth/callback/spotify` (development)
   - `https://yourdomain.com/api/auth/callback/spotify` (production)
4. Copy your Client ID and Client Secret to `.env`

**Required Scopes:**
- `user-read-email`
- `user-read-private`
- `user-read-playback-state`
- `user-read-currently-playing`
- `user-read-recently-played`
- `user-top-read`
- `user-library-read`

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Copy your project URL and keys to `.env`
3. Run the database schema (see below)

### Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy to `.env` as `GEMINI_API_KEY`

## Database Schema

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
CREATE INDEX idx_listening_history_user_played ON listening_history(user_id, played_at DESC);
CREATE INDEX idx_recommendations_user_expires ON recommendations(user_id, expires_at);
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # OAuth endpoints (session, signin, signout, callback)
│   │   ├── ai/                # Gemini AI recommendations
│   │   ├── history/           # Listening history queries
│   │   ├── spotify/           # Spotify API proxies
│   │   │   ├── me/            # User profile
│   │   │   ├── now-playing/   # Currently playing
│   │   │   ├── recent-tracks/ # Recently played
│   │   │   ├── top-artists/   # Top artists
│   │   │   ├── top-tracks/    # Top tracks
│   │   │   └── top-albums/    # Top albums (derived)
│   │   ├── stats/             # Listening statistics
│   │   ├── sync/              # History sync to Supabase
│   │   └── tour-status/       # AI-powered tour discovery
│   │       ├── route.ts       # Single artist lookup
│   │       └── batch/         # Batch artist lookup
│   ├── auth/
│   │   ├── login/             # Login page
│   │   └── error/             # Auth error page
│   └── dashboard/
│       ├── page.tsx           # Home dashboard
│       ├── layout.tsx         # Dashboard layout with nav
│       ├── concerts/          # Concert discovery
│       ├── discover/          # AI recommendations
│       ├── history/           # Listening history
│       ├── share/             # Social card generator
│       ├── top/               # Top charts (artists/tracks/albums)
│       └── wrapped/           # Custom wrapped experience
├── components/
│   ├── crt/                   # CRT-themed UI components
│   │   ├── CRTWrapper.tsx     # Main wrapper with effects
│   │   ├── GlowText.tsx       # Text with phosphor glow
│   │   ├── TerminalCard.tsx   # Card with terminal header
│   │   ├── TerminalButton.tsx # Button with CRT styling
│   │   └── TerminalInput.tsx  # Input with terminal styling
│   ├── dashboard/
│   │   ├── TopArtists.tsx     # Artists grid/list view
│   │   └── UpcomingConcerts.tsx # Concerts section
│   ├── icons/
│   │   └── FeatureIcons.tsx   # Animated feature icons
│   └── ui/
│       └── OnTourBadge.tsx    # Tour badge (3 variants)
├── hooks/
│   ├── useGeolocation.ts      # Browser geolocation
│   └── useTourStatus.ts       # Tour data fetching
├── lib/
│   ├── auth.ts                # Auth configuration
│   ├── geo.ts                 # Geolocation utilities
│   ├── session.ts             # Session management
│   ├── spotify.ts             # Spotify API client
│   ├── supabase/              # Supabase clients
│   ├── theme.ts               # Theme context
│   └── utils.ts               # Utility functions
├── messages/
│   ├── en.json                # English translations
│   └── pt-BR.json             # Portuguese translations
└── types/
    └── tour.ts                # Tour-related types
```

## API Routes

### Authentication
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/session` | GET | Get current session |
| `/api/auth/signin/spotify` | GET | Initiate Spotify OAuth |
| `/api/auth/callback/spotify` | GET | OAuth callback handler |
| `/api/auth/signout` | POST | Sign out user |

### Spotify Data
| Route | Method | Description |
|-------|--------|-------------|
| `/api/spotify/me` | GET | Get user profile |
| `/api/spotify/now-playing` | GET | Get currently playing |
| `/api/spotify/recent-tracks` | GET | Get recent tracks |
| `/api/spotify/top-artists` | GET | Get top artists |
| `/api/spotify/top-tracks` | GET | Get top tracks |
| `/api/spotify/top-albums` | GET | Get top albums |

### Data & Stats
| Route | Method | Description |
|-------|--------|-------------|
| `/api/history` | GET | Query listening history |
| `/api/stats` | GET | Get listening statistics |
| `/api/sync/history` | POST | Sync history to database |

### AI Features
| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai/recommendations` | GET | Get AI recommendations |
| `/api/tour-status` | GET | Single artist tour lookup |
| `/api/tour-status/batch` | POST | Batch tour lookup |

## Key Components

### OnTourBadge
Three variants for different contexts:
- `indicator` — Minimal glowing dot for circular overlays
- `compact` — Small pill with "LIVE" for grid cards
- `badge` — Full badge with "ON TOUR" text

### FeatureIcons
Animated icons using Framer Motion:
- `ListeningStatsIcon` — Equalizer bars
- `AIDiscoverIcon` — Neural network sparks
- `ConcertsIcon` — Stage spotlights
- `ShareIcon` — Broadcasting signals
- `WrappedIcon` — Rotating time rings

### Tour Status Hook
```typescript
// Single artist
const { data, isLoading } = useTourStatus({
  artistName: "Artist Name",
  lat: 40.7128,
  lng: -74.0060,
});

// Batch lookup
const { data } = useTourStatusBatch(
  ["Artist 1", "Artist 2"],
  lat,
  lng
);
```

## Development

### Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Locale-Aware Features

The tour discovery system adapts to the user's locale:

**English (en):**
- Search terms: "concerts, tour dates, live shows"
- Default location: New York, USA
- Country focus: United States

**Portuguese (pt-BR):**
- Search terms: "shows, turnê, concertos, apresentações"
- Default location: São Paulo, Brazil
- Country focus: Brazil

### Geolocation Fallbacks

1. Browser Geolocation API (if permitted)
2. Closest known city from coordinates
3. Locale-based default (São Paulo or New York)

### Caching Strategy

| Data | Stale Time | GC Time |
|------|------------|---------|
| Now Playing | 10s refresh | — |
| Top Artists/Tracks | 5 min | 10 min |
| AI Recommendations | 1 hour | 24 hours |
| Tour Status | 24 hours | 7 days |
