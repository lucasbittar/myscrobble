import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt-BR'],
  defaultLocale: 'en',
  localePrefix: 'never', // No URL prefix - URLs stay as /dashboard
  localeDetection: true
});
