import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000';
const REDIRECT_URI = `${BASE_URL}/api/auth/callback/spotify`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, BASE_URL));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?error=NoCode', BASE_URL));
  }

  // Verify state for CSRF protection
  const cookieStore = await cookies();
  const storedState = cookieStore.get('spotify-oauth-state')?.value;

  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/auth/error?error=InvalidState', BASE_URL));
  }

  // Clear the state cookie
  cookieStore.delete('spotify-oauth-state');

  try {
    // Exchange code for tokens with correct redirect_uri
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokens);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${tokens.error || 'TokenError'}`, BASE_URL)
      );
    }

    // Get user info
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const user = await userResponse.json();

    // Create session data
    const sessionData = {
      user: {
        id: user.id,
        name: user.display_name,
        email: user.email,
        image: user.images?.[0]?.url,
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
    };

    // Store in a secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('spotify-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.redirect(new URL('/dashboard', BASE_URL));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=ServerError', BASE_URL));
  }
}
