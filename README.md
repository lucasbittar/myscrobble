# MyScrobble.fm

A modern Spotify dashboard that brings your listening data to life with AI-powered insights, concert discovery, and beautiful visualizations — all wrapped in a nostalgic CRT terminal aesthetic.

![MyScrobble Dashboard](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) ![Spotify](https://img.shields.io/badge/Spotify-API-1DB954?style=flat-square&logo=spotify)

## What is MyScrobble?

MyScrobble transforms your Spotify listening data into meaningful insights. Connect your Spotify account and discover patterns in your music taste, get AI-powered recommendations, find concerts near you, and create shareable cards of your top artists and tracks.

## Features

### Now Playing & Recent Activity
See what you're currently listening to with real-time updates, plus a timeline of your recent tracks with beautiful album art displays.

### Your Top Charts
Explore your most-played artists, tracks, and albums across different time periods — last 4 weeks, 6 months, or all time. Watch your music taste evolve with an interactive podium-style leaderboard.

### AI Discover
Get personalized artist recommendations powered by Google Gemini AI. Based on your listening habits, discover new music you'll love with curated starter songs for each suggestion.

### Concert Discovery
Find upcoming shows from your favorite artists near you. Powered by AI-driven search with real-time tour data, location-aware filtering, and direct ticket links. Supports both English and Portuguese locales for optimized results.

### Your Wrapped
Create your own "Wrapped" experience anytime — not just in December. Pick any date range and get a beautiful carousel presentation of your top artists, tracks, genres, and listening patterns.

### Social Sharing
Generate stunning Instagram Story-ready cards (1080x1920) featuring your top artists, tracks, or listening stats. Download as PNG and share your music taste with friends.

### Listening History
Sync your Spotify history to a database for long-term tracking beyond Spotify's 50-track limit. Filter by day, week, month, or browse your complete listening timeline.

### Internationalization
Full support for English and Portuguese (Brazilian) with locale-aware features including tour search optimization for each region.

## The CRT Aesthetic

MyScrobble features a distinctive retro terminal design inspired by vintage CRT monitors:

- **Phosphor Green** (#00ff41) — Primary glow
- **Cyan** (#00f5ff) — Accents and highlights
- **Magenta** (#ff00ff) — Badges and emphasis
- **Amber** (#ffb000) — Wrapped theme
- Scanline effects, text glow, and terminal typography

## Getting Started

See [TECHNICAL.md](./TECHNICAL.md) for detailed setup instructions, environment variables, database schema, and project structure.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/myscrobble.git

# Install dependencies
npm install

# Set up environment variables (see TECHNICAL.md)
cp .env.example .env

# Run development server
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) and connect your Spotify account.

## Screenshots

*Coming soon*

## Built With

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **TanStack Query** — Data fetching and caching
- **Google Gemini AI** — Artist recommendations & tour discovery
- **Supabase** — PostgreSQL database for history storage
- **Spotify Web API** — Music data and playback

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

Built by [Lucas Bittar](https://lucasbittar.dev)
