-- MyScrobble Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Spotify)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spotify_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  country TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listening history table (core data for filtering and stats)
CREATE TABLE IF NOT EXISTS listening_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  album_art_url TEXT,
  played_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate entries for the same track at the same time
  UNIQUE(user_id, track_id, played_at)
);

-- Cached AI recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_played_at ON listening_history(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_history_user_played ON listening_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_history_artist ON listening_history(user_id, artist_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires ON recommendations(expires_at);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = spotify_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = spotify_id);

-- For server-side operations (using service role key), we need to allow all
CREATE POLICY "Service role full access to users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to listening_history" ON listening_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to recommendations" ON recommendations
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for listening statistics
CREATE OR REPLACE VIEW user_listening_stats AS
SELECT
  user_id,
  COUNT(DISTINCT track_id) as unique_tracks,
  COUNT(DISTINCT artist_id) as unique_artists,
  COUNT(*) as total_plays,
  SUM(duration_ms) / 1000 / 60 as total_minutes,
  MIN(played_at) as first_play,
  MAX(played_at) as last_play
FROM listening_history
GROUP BY user_id;

-- View for top artists by user
CREATE OR REPLACE VIEW user_top_artists AS
SELECT
  user_id,
  artist_id,
  artist_name,
  COUNT(*) as play_count,
  SUM(duration_ms) / 1000 / 60 as total_minutes
FROM listening_history
GROUP BY user_id, artist_id, artist_name
ORDER BY play_count DESC;

-- View for recent activity (last 7 days)
CREATE OR REPLACE VIEW user_recent_activity AS
SELECT
  user_id,
  DATE(played_at) as play_date,
  COUNT(*) as tracks_played,
  SUM(duration_ms) / 1000 / 60 as minutes_listened
FROM listening_history
WHERE played_at > NOW() - INTERVAL '7 days'
GROUP BY user_id, DATE(played_at)
ORDER BY play_date DESC;
