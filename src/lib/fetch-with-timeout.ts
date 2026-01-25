/**
 * Fetch and promise timeout utilities
 */

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Alias for backwards compatibility
export const FetchTimeoutError = TimeoutError;

/**
 * Wrap any promise with a timeout
 * @param promise - Promise to wrap
 * @param timeout - Timeout in milliseconds
 * @param message - Custom timeout message
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  message?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(message || `Operation timed out after ${timeout}ms`)),
        timeout
      )
    ),
  ]);
}

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with configurable timeout
 * @param url - URL to fetch
 * @param options - Fetch options with optional timeout (default: 10000ms)
 * @returns Response promise
 */
export async function fetchWithTimeout(
  url: string | URL,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchTimeoutError(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
