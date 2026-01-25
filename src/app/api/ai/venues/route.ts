import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/session";
import { withTimeout } from "@/lib/fetch-with-timeout";
import { sanitizeGenres } from "@/lib/sanitize";
import { getDefaultLocation, calculateDistanceKm } from "@/lib/geo";
import type { Venue, VenueResponse } from "@/types/venue";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Reverse geocode coordinates to get city name using Nominatim (OpenStreetMap)
async function getCityFromCoordinates(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: {
          'User-Agent': 'MyScrobble/1.0 (music discovery app)',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    // Nominatim returns city, town, village, or municipality depending on location size
    return data.address?.city ||
           data.address?.town ||
           data.address?.village ||
           data.address?.municipality ||
           data.address?.county ||
           null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

// Helper function to detect locale
async function detectLocale(): Promise<string> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;

  if (localeCookie && ["en", "pt-BR"].includes(localeCookie)) {
    return localeCookie;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";

  if (acceptLanguage.toLowerCase().includes("pt")) {
    return "pt-BR";
  }

  return "en";
}

interface GeminiVenue {
  name: string;
  address: string;
  city: string;
  genres: string[];
  description: string;
  latitude: number;
  longitude: number;
  website?: string;
  type: string;
}

interface GeminiResponse {
  venues: GeminiVenue[];
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const genresParam = searchParams.get("genres");

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Get location from params or use default based on locale
    const locale = await detectLocale();
    const defaultLocation = getDefaultLocation(locale);

    const userLocation = {
      lat: latParam ? parseFloat(latParam) : defaultLocation.lat,
      lng: lngParam ? parseFloat(lngParam) : defaultLocation.lng,
    };

    // Parse and sanitize genres from param or use defaults
    const rawGenres = genresParam
      ? genresParam.split(",").map((g) => g.trim())
      : ["pop", "rock", "electronic"];
    const genres = sanitizeGenres(rawGenres);

    // First, get the city name from coordinates
    const cityName = await getCityFromCoordinates(userLocation.lat, userLocation.lng);

    if (!cityName) {
      console.error('Could not determine city from coordinates');
      return NextResponse.json({
        venues: [],
        basedOnGenres: genres,
        generatedAt: new Date().toISOString(),
        cached: false,
        detectedCity: null,
      } satisfies VenueResponse & { detectedCity: string | null });
    }

    // Configure Gemini with Google Search tool
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ googleSearch: {} } as any],
    });

    // Use locale-appropriate labels
    const isPtBr = locale === "pt-BR";
    const venueTypeLabels = isPtBr
      ? "bar, balada (club), casa de shows (venue), restaurante"
      : "bar, club, venue, restaurant";

    // Simple, direct prompt - similar to what the user tested successfully
    const prompt = `Given this city name and a list of music genres, find places that play those types of music.

City: ${cityName}

Genres: ${genres.join(", ")}

Search for live music venues, bars with live performances, clubs, and places known for these music genres in ${cityName}.

Return ONLY a valid JSON object with this structure:
{
  "venues": [
    {
      "name": "Venue Name",
      "address": "Full Address",
      "city": "${cityName}",
      "genres": ["genre1", "genre2"],
      "description": "Brief description of the venue and what kind of music they play",
      "latitude": 0.0,
      "longitude": 0.0,
      "website": "https://example.com",
      "type": "bar|club|venue|restaurant"
    }
  ]
}

Guidelines:
- Return 4-8 venues that match the music genres
- Include accurate coordinates for mapping
- type must be one of: ${venueTypeLabels}
- Only respond with valid JSON, no additional text or markdown`;

    const result = await withTimeout(
      model.generateContent(prompt),
      30000, // 30 second timeout for AI generation
      "Venues request timed out"
    );
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let geminiResponse: GeminiResponse;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

      // Fix common JSON issues from AI responses
      const openBraces = (cleanedText.match(/\{/g) || []).length;
      const closeBraces = (cleanedText.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        cleanedText += "}".repeat(openBraces - closeBraces);
      }

      // Remove trailing commas before ] or }
      cleanedText = cleanedText.replace(/,(\s*[}\]])/g, "$1");

      geminiResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text, parseError);
      return NextResponse.json({
        venues: [],
        basedOnGenres: genres,
        generatedAt: new Date().toISOString(),
        cached: false,
        detectedCity: null,
      } satisfies VenueResponse & { detectedCity: string | null });
    }

    // Process venues and add distance, filter out any that are too far
    const MAX_DISTANCE_KM = 20; // Maximum 20km from user

    const venuesWithDistance: Venue[] = geminiResponse.venues
      .filter((v) => v.latitude && v.longitude)
      .map((venue) => {
        const distanceKm = calculateDistanceKm(userLocation, {
          lat: venue.latitude,
          lng: venue.longitude,
        });

        // Normalize venue type
        const normalizedType = (() => {
          const t = venue.type?.toLowerCase() || "venue";
          if (t.includes("bar")) return "bar";
          if (t.includes("club") || t.includes("balada")) return "club";
          if (t.includes("restaurant") || t.includes("restaurante")) return "restaurant";
          return "venue";
        })() as Venue["type"];

        return {
          name: venue.name,
          address: venue.address,
          city: venue.city,
          genres: venue.genres || [],
          description: venue.description || "",
          latitude: venue.latitude,
          longitude: venue.longitude,
          distanceKm,
          website: venue.website,
          type: normalizedType,
        };
      })
      // Filter out venues that are too far (in case AI included some anyway)
      .filter((v) => (v.distanceKm || 0) <= MAX_DISTANCE_KM)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    const venueResponse: VenueResponse & { detectedCity: string | null } = {
      venues: venuesWithDistance,
      basedOnGenres: genres,
      generatedAt: new Date().toISOString(),
      cached: false,
      detectedCity: cityName,
    };

    return NextResponse.json(venueResponse);
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json({
      venues: [],
      basedOnGenres: [],
      generatedAt: new Date().toISOString(),
      cached: false,
      detectedCity: null,
    } satisfies VenueResponse & { detectedCity: string | null });
  }
}
