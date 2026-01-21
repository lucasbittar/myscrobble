# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyScrobble is a modern Spotify dashboard with AI-powered recommendations, concert discovery, and a clean glass-morphism design. Built with Next.js 14, it provides visualization of listening history, top artists/tracks, and shareable social media cards.

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
- `/api/tour-status` - AI-powered tour date lookup (single artist)
- `/api/tour-status/batch` - AI-powered tour dates for multiple artists

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

**Design Theme**: Modern glass-morphism with clean aesthetics:
- Glass/blur backgrounds: `bg-white/60 dark:bg-white/10 backdrop-blur-xl`
- Soft shadows and rounded corners (`rounded-2xl`, `rounded-full`)
- Section-specific accent colors (see Color Palette below)
- Smooth Framer Motion animations

**External APIs**:
- Spotify Web API for user data, playback, top artists/tracks
- Google Gemini API for AI recommendations and tour date discovery (with Google Search)

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
- `UpcomingConcerts` - AI-powered concert discovery section

UI components in `src/components/ui/`:
- `OnTourBadge` - Animated badge for artists on tour

Modern components in `src/components/modern/`:
- `PageHeader` - Consistent page header with subtitle, title, and optional right content
- `ModernButton` - Button with variants (primary, secondary, ghost) and sizes

Concert components in `src/components/concerts/`:
- `ConcertHero` - Hero card for the next upcoming concert
- `ConcertTimeline` - Timeline view for upcoming concerts
- `VenueMapInteractive` - Leaflet-based interactive map for venue discovery

## Design System

### Page Headers

Always use the `PageHeader` component for page titles:

```tsx
import { PageHeader } from '@/components/modern';

<PageHeader
  subtitle={t('subtitle')}  // Small uppercase label
  title={t('title')}        // Large bold title
  rightContent={...}        // Optional right-aligned content
/>
```

### Loading Indicators

All loading spinners must follow these specs for consistency:

| Property | Value |
|----------|-------|
| Border width | `border-2` |
| Duration | `1s` (1 rotation per second) |
| Easing | `ease: 'linear'` |
| Shape | `rounded-full` with `border-t-transparent` |

**Size tiers:**
- Small (buttons): `w-4 h-4`
- Medium (sections): `w-8 h-8`
- Large (page-level): `w-12 h-12`

**Example:**
```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  className="w-8 h-8 rounded-full border-2 border-[#1DB954] border-t-transparent"
/>
```

### Color Palette by Section

Each section uses a specific accent color:

| Section | Color | Hex |
|---------|-------|-----|
| Dashboard/Layout | Spotify Green | `#1DB954` |
| History | Spotify Green | `#1DB954` |
| Top Charts | Purple | `#8B5CF6` |
| Discover | Purple | `#8B5CF6` |
| Concerts | Pink/Magenta | `#EC4899` |
| Podcasts | Teal | `#14B8A6` |
| Wrapped | Amber | `#F59E0B` |
| Buttons (on colored bg) | White | `currentColor` |

### Glass Effects

Standard glass card pattern:
```tsx
className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20"
```

## Internationalization (i18n)

**Always use translations** - never hardcode user-facing strings.

### Usage

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('namespace');
  const tCommon = useTranslations('common');

  return <h1>{t('title')}</h1>;
}
```

### Translation Files

- Location: `messages/en.json`, `messages/pt-BR.json`
- Always add keys to both language files
- Use nested namespaces matching page/component names

### Checklist for New Features

1. Check if translation keys already exist in the relevant namespace
2. Add new keys to both `en.json` and `pt-BR.json`
3. Use `useTranslations` hook with appropriate namespace
4. For shared text (buttons, labels), use `common` namespace

## Coding Standards

### Animations

Use Framer Motion for all animations:
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

### Component Patterns

- Use `'use client'` directive for components with hooks/interactivity
- Prefer composition over props for complex layouts
- Extract reusable patterns into `src/components/modern/`

### Data Fetching

- Use TanStack Query (`@tanstack/react-query`) for all API calls
- Implement proper loading and error states
- Use `staleTime` for caching where appropriate
