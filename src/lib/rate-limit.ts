/**
 * In-memory rate limiter with sliding window
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
// Note: This resets on server restart and doesn't work across multiple instances
// For production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let cleanupScheduled = false;

function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request should be allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  scheduleCleanup();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // AI endpoints (Gemini API) - more restrictive due to cost
  ai: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
  // Spotify proxy endpoints
  spotify: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 60 requests per minute
  },
  // General API endpoints
  general: {
    maxRequests: 120,
    windowMs: 60 * 1000, // 120 requests per minute
  },
} as const;

/**
 * Get the appropriate rate limit config for a given path
 */
export function getRateLimitForPath(pathname: string): RateLimitConfig {
  // AI endpoints
  if (
    pathname.startsWith('/api/ai/') ||
    pathname.startsWith('/api/tour-status')
  ) {
    return RATE_LIMITS.ai;
  }

  // Spotify proxy endpoints
  if (pathname.startsWith('/api/spotify/')) {
    return RATE_LIMITS.spotify;
  }

  // All other API endpoints
  return RATE_LIMITS.general;
}
