import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Skip API routes from locale processing
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
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
