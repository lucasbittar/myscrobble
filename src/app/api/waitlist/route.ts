import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface WaitlistEntry {
  id: string;
  created_at: string;
}

// POST: Add email to waitlist
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, spotifyId, spotifyName, spotifyImage } = body;

    // Validate email
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      const typedExisting = existing as WaitlistEntry;
      // Get position in queue
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', typedExisting.created_at);

      return NextResponse.json({
        success: true,
        alreadyExists: true,
        position: count || 1,
      });
    }

    // Insert new waitlist entry
    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        spotify_id: spotifyId || null,
        spotify_name: spotifyName || null,
        spotify_image: spotifyImage || null,
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('Error inserting to waitlist:', insertError);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    const typedNewEntry = newEntry as WaitlistEntry;

    // Get position in queue
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', typedNewEntry.created_at);

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      position: count || 1,
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Check if email exists and get position
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Check if email exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (!existing) {
      return NextResponse.json({
        exists: false,
      });
    }

    const typedExisting = existing as WaitlistEntry;

    // Get position in queue
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', typedExisting.created_at);

    return NextResponse.json({
      exists: true,
      position: count || 1,
    });
  } catch (error) {
    console.error('Waitlist check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
