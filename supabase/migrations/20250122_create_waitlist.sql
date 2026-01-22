-- Waitlist table for Spotify API quota limitation
-- Users who authenticate but are blocked by the 25-user development mode limit

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  spotify_id TEXT,
  spotify_name TEXT,
  spotify_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Index for quick email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Index for getting position (ordered by creation time)
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Index for finding unconverted/unnotified users
CREATE INDEX IF NOT EXISTS idx_waitlist_notified ON waitlist(notified_at) WHERE notified_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_converted ON waitlist(converted_at) WHERE converted_at IS NULL;

-- Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Service role full access for server-side operations
CREATE POLICY "Service role full access to waitlist" ON waitlist
  FOR ALL USING (auth.role() = 'service_role');
