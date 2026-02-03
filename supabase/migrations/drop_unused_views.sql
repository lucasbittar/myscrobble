-- Drop unused SECURITY DEFINER views that bypass RLS policies
DROP VIEW IF EXISTS user_listening_stats;
DROP VIEW IF EXISTS user_top_artists;
DROP VIEW IF EXISTS user_recent_activity;
