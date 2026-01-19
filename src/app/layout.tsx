import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, VT323 } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from '@/lib/theme';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

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
      </body>
    </html>
  );
}
