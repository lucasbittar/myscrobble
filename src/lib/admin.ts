/**
 * Admin utilities for RBAC
 */

/**
 * Parse admin emails from environment variable
 * Supports comma-separated list of emails
 */
function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  return adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

/**
 * Check if an email belongs to an admin user
 * @param email - User's email address
 * @returns true if the user is an admin
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;

  const adminEmails = getAdminEmails();

  // If no admin emails configured, deny all
  if (adminEmails.length === 0) {
    return false;
  }

  return adminEmails.includes(email.toLowerCase());
}

/**
 * Maximum number of users allowed (Spotify dev mode limit)
 */
export const SPOTIFY_MAX_USERS = 25;
