import { cookies } from 'next/headers';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Session {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('spotify-session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value) as Session;

    // Check if token is expired
    if (session.expiresAt && session.expiresAt * 1000 < Date.now()) {
      // Token expired, try to refresh
      const refreshedSession = await refreshToken(session);
      if (refreshedSession) {
        // Update the cookie with new tokens
        cookieStore.set('spotify-session', JSON.stringify(refreshedSession), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
        return refreshedSession;
      } else {
        // Refresh failed, clear session
        cookieStore.delete('spotify-session');
        return null;
      }
    }

    return session;
  } catch (error) {
    console.error('Session parse error:', error);
    return null;
  }
}

async function refreshToken(session: Session): Promise<Session | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error('Token refresh error:', tokens);
      return null;
    }

    return {
      user: session.user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? session.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}
