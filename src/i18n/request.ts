import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { routing } from './routing';

export default getRequestConfig(async () => {
  // 1. Check cookie first (returning users)
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value;

  // 2. If no cookie, check Accept-Language header (new users)
  if (!locale) {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');

    if (acceptLanguage) {
      // Parse Accept-Language header and find best match
      const languages = acceptLanguage
        .split(',')
        .map(lang => {
          const [code, priority] = lang.trim().split(';q=');
          return {
            code: code.trim(),
            priority: priority ? parseFloat(priority) : 1
          };
        })
        .sort((a, b) => b.priority - a.priority);

      // Find first matching locale
      for (const lang of languages) {
        const langCode = lang.code.toLowerCase();
        // Check for exact match or prefix match (pt-BR, pt, etc.)
        if (langCode === 'pt-br' || langCode === 'pt') {
          locale = 'pt-BR';
          break;
        }
        if (langCode.startsWith('en')) {
          locale = 'en';
          break;
        }
      }
    }
  }

  // 3. Fallback to default locale
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
