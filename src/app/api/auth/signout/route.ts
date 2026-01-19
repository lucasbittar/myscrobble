import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete('spotify-session');

  return NextResponse.redirect(new URL('/', BASE_URL));
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('spotify-session');

  return NextResponse.json({ success: true });
}
