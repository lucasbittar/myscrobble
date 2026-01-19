# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyScrobble is a modern Spotify dashboard with AI-powered recommendations, concert discovery, and a retro CRT terminal aesthetic. Built with Next.js 14, it provides visualization of listening history, top artists/tracks, and shareable social media cards.

## Build Commands

```bash
# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

**Framework**: Next.js 14 with App Router, TypeScript, Tailwind CSS

**Key Directories**:
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (crt/, dashboard/, ui/)
- `src/lib/` - Utilities (auth, spotify client, supabase, date helpers)
- `supabase/` - Database schema SQL files
- `public/` - Static assets

**Authentication**: NextAuth.js v5 with Spotify OAuth provider

**API Routes**:
- `/api/auth/[...nextauth]` - NextAuth handler
- `/api/spotify/*` - Spotify API proxies (now-playing, recent-tracks, top-artists, top-tracks, me)
- `/api/ai/recommendations` - Gemini AI recommendations
- `/api/concerts` - Bandsintown concert data

**Pages**:
- `/` - Landing page with Spotify login
- `/auth/login` - Login page
- `/auth/error` - Error handling
- `/dashboard` - Main dashboard overview
- `/dashboard/history` - Listening history
- `/dashboard/top` - Top artists/tracks charts
- `/dashboard/discover` - AI recommendations
- `/dashboard/concerts` - Concert finder
- `/dashboard/wrapped` - Spotify Wrapped experience
- `/dashboard/share` - Social media card generator

**CRT Theme**: Custom retro terminal aesthetic with:
- Green phosphor (#00ff41) as primary
- Cyan (#00f5ff), Magenta (#ff00ff), Amber (#ffb000) accents
- Scanline effects, glow text, screen flicker
- VT323 and IBM Plex Mono fonts

**External APIs**:
- Spotify Web API for user data, playback, top artists/tracks
- Google Gemini API for AI recommendations
- Bandsintown API for concert discovery

**Database**: Supabase (PostgreSQL) for:
- User profiles synced from Spotify
- Listening history storage (beyond Spotify's 50-track limit)
- Cached AI recommendations

## Environment Variables

Required in `.env`:
```
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
BANDSINTOWN_APP_ID
```

## Component Library

Custom CRT-themed components in `src/components/crt/`:
- `CRTWrapper` - Main wrapper with scanlines and effects
- `GlowText` - Text with phosphor glow
- `TerminalCard` - Card with terminal header
- `TerminalButton` - Button with CRT styling
- `TerminalInput` - Input field with terminal styling

Dashboard components in `src/components/dashboard/`:
- `NowPlaying` - Currently playing track widget
- `RecentTracks` - Recent listening history list
- `TopArtists` - Top artists grid/list
- `TopTracks` - Top tracks list
