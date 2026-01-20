import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, VT323 } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from '@/lib/theme';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const vt323 = VT323({
  variable: '--font-vt323',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'MyScrobble.fm | Your Spotify Dashboard',
  description:
    'Visualize your Spotify listening history with AI-powered recommendations, concert discovery, and a retro CRT terminal aesthetic.',
  keywords: ['Spotify', 'music', 'dashboard', 'scrobble', 'listening history', 'analytics'],
  authors: [{ name: 'MyScrobble.fm' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'MyScrobble.fm | Your Spotify Dashboard',
    description: 'Visualize your Spotify listening history with AI-powered recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyScrobble.fm | Your Spotify Dashboard',
    description: 'Visualize your Spotify listening history with AI-powered recommendations.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body
        className={`${ibmPlexMono.variable} ${vt323.variable} font-mono antialiased bg-background text-foreground min-h-screen`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ThemeProvider>{children}</ThemeProvider>
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
