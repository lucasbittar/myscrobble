/**
 * Input sanitization utilities for AI prompts and user input
 */

/**
 * Sanitize a string for use in AI prompts to prevent prompt injection
 * - Removes or escapes control characters
 * - Strips potential prompt injection patterns
 * - Limits length
 */
export function sanitizeForAIPrompt(input: string, maxLength = 200): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove common prompt injection patterns
    .replace(/\b(ignore|forget|disregard)\s+(all|previous|above)\s+(instructions?|prompts?|text)/gi, '')
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\{[\s\S]*?\}/g, match => {
      // Only remove if it looks like JSON/template injection
      if (match.includes('"') || match.includes("'") || match.includes(':')) {
        return '';
      }
      return match;
    })
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength).trim();
  }

  return sanitized;
}

/**
 * Sanitize an artist name for use in AI prompts
 * More permissive than general sanitization to allow special characters in names
 */
export function sanitizeArtistName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove obvious injection attempts
    .replace(/\b(ignore|forget|disregard)\s+(all|previous|above)/gi, '')
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit length (artist names shouldn't be too long)
    .slice(0, 100);
}

/**
 * Sanitize an array of artist names
 */
export function sanitizeArtistNames(names: string[]): string[] {
  if (!Array.isArray(names)) {
    return [];
  }

  return names
    .map(sanitizeArtistName)
    .filter(name => name.length > 0);
}

/**
 * Sanitize genre names for AI prompts
 */
export function sanitizeGenre(genre: string): string {
  if (!genre || typeof genre !== 'string') {
    return '';
  }

  return genre
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);
}

/**
 * Sanitize an array of genre names
 */
export function sanitizeGenres(genres: string[]): string[] {
  if (!Array.isArray(genres)) {
    return [];
  }

  return genres
    .map(sanitizeGenre)
    .filter(genre => genre.length > 0);
}
