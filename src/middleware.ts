import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getRateLimitForPath } from '@/lib/rate-limit';

const locales = ['en', 'pt-BR'];
const defaultLocale = 'en';
const COOKIE_NAME = 'NEXT_LOCALE';

// Teaser mode: when true, only landing page is accessible
const IS_TEASER_MODE = process.env.NEXT_PUBLIC_TEASER === 'true';

function getPreferredLocale(request: NextRequest): string {
  // 1. Check cookie first (returning users)
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header (new users)
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, priority] = lang.trim().split(';q=');
        return {
          code: code.trim().toLowerCase(),
          priority: priority ? parseFloat(priority) : 1
        };
      })
      .sort((a, b) => b.priority - a.priority);

    // Find first matching locale
    for (const lang of languages) {
      // Check for Portuguese variants
      if (lang.code === 'pt-br' || lang.code === 'pt') {
        return 'pt-BR';
      }
      // Check for English variants
      if (lang.code.startsWith('en')) {
        return 'en';
      }
    }
  }

  // 3. Fallback to default locale
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    // Skip auth endpoints from rate limiting
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // Get client identifier (prefer forwarded IP for proxied requests)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const identifier = `${ip}:${pathname}`;

    const config = getRateLimitForPath(pathname);
    const result = checkRateLimit(identifier, config);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetAt),
          },
        }
      );
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.resetAt));
    return response;
  }

  // TEASER MODE: Block all routes except landing page and privacy policy
  if (IS_TEASER_MODE && pathname !== '/' && pathname !== '/privacy') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  const preferredLocale = getPreferredLocale(request);
  const response = NextResponse.next();

  // Set/update the locale cookie if not already set
  const existingCookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!existingCookie || !locales.includes(existingCookie)) {
    response.cookies.set(COOKIE_NAME, preferredLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
