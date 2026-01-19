import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, VT323 } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

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
  title: 'MyScrobble | Your Spotify Dashboard',
  description:
    'Visualize your Spotify listening history with AI-powered recommendations, concert discovery, and a retro CRT terminal aesthetic.',
  keywords: ['Spotify', 'music', 'dashboard', 'scrobble', 'listening history', 'analytics'],
  authors: [{ name: 'MyScrobble' }],
  openGraph: {
    title: 'MyScrobble | Your Spotify Dashboard',
    description: 'Visualize your Spotify listening history with AI-powered recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyScrobble | Your Spotify Dashboard',
    description: 'Visualize your Spotify listening history with AI-powered recommendations.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexMono.variable} ${vt323.variable} font-mono antialiased bg-[#0a0a0a] text-[#e0e0e0] min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
