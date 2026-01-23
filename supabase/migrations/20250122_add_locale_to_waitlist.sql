-- Add locale column to waitlist table for i18n email support
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
