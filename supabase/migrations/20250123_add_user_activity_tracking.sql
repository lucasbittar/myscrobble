-- Add activity tracking columns for bouncer system
-- Tracks user activity to manage Spotify's 25-user development mode limit

-- Add last_active_at column to track when user last visited the dashboard
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Add is_active flag to soft-delete/bounce users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Index for efficient inactive user queries (finding sleepers)
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);

-- Index for filtering active users
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Combined index for finding inactive users who are still marked active
CREATE INDEX IF NOT EXISTS idx_users_active_sleepers ON users(is_active, last_active_at)
WHERE is_active = TRUE;
