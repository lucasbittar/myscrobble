import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-recently-played',
  'user-top-read',
  'user-library-read',
  'user-read-currently-playing',
  'user-read-playback-state',
].join(' ');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000';
const REDIRECT_URI = `${BASE_URL}/api/auth/callback/spotify`;

export async function GET() {
  // Generate a random state for CSRF protection
  const state = randomBytes(16).toString('hex');

  // Store state in cookie for verification in callback
  const cookieStore = await cookies();
  cookieStore.set('spotify-oauth-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  // Build the Spotify authorization URL
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', process.env.SPOTIFY_CLIENT_ID!);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SPOTIFY_SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('show_dialog', 'true');

  return NextResponse.redirect(authUrl.toString());
}
