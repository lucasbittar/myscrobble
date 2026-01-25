import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/session";
import { withTimeout } from "@/lib/fetch-with-timeout";
import { sanitizeArtistNames } from "@/lib/sanitize";
import {
  filterEventsByDistance,
  getDefaultLocation,
  getLocationForSearch,
  DEFAULT_RADIUS_KM,
} from "@/lib/geo";
import type { BatchTourStatusResponse, TourEvent } from "@/types/tour";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

interface GeminiEvent {
  date: string;
  venue: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

interface GeminiArtistResponse {
  onTour: boolean;
  events: GeminiEvent[];
}

interface GeminiBatchResponse {
  [artistName: string]: GeminiArtistResponse;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { artists: rawArtists, lat, lng } = body as {
      artists: string[];
      lat?: number;
      lng?: number;
    };

    if (!rawArtists || !Array.isArray(rawArtists) || rawArtists.length === 0) {
      return NextResponse.json(
        { error: "Artists array is required" },
        { status: 400 }
      );
    }

    // Sanitize artist names to prevent prompt injection
    const artists = sanitizeArtistNames(rawArtists);
    if (artists.length === 0) {
      return NextResponse.json(
        { error: "No valid artist names provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Limit to 10 artists per batch
    const limitedArtists = artists.slice(0, 10);

    // Get location from params or use default based on locale
    const locale = await detectLocale();
    const defaultLocation = getDefaultLocation(locale);

    const userLocation = {
      lat: lat ?? defaultLocation.lat,
      lng: lng ?? defaultLocation.lng,
    };

    // Get location name for prompt (much better for search than coordinates)
    const locationName = getLocationForSearch(userLocation.lat, userLocation.lng);

    // Configure Gemini with Google Search tool
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ googleSearch: {} } as any],
    });

    // Use locale-appropriate search terms for better results
    const isPtBr = locale === "pt-BR";
    const searchTerms = isPtBr
      ? `shows, turnê, concertos, apresentações`
      : `concerts, tour dates, live shows`;
    const countryHint = isPtBr ? "Brazil" : "United States";

    const artistsList = limitedArtists.map((a, i) => `${i + 1}. ${a}`).join("\n");

    const prompt = `Search for upcoming 2026 concert tour dates for the following artists:
${artistsList}

Search terms to use: ${searchTerms}
Focus on events in ${countryHint}, specifically in or near ${locationName}.

Return ONLY a valid JSON object with each artist as a key:
{
  "Artist Name 1": {
    "onTour": true/false,
    "events": [
      {
        "date": "YYYY-MM-DD",
        "venue": "Venue Name",
        "city": "City Name",
        "latitude": 0.0,
        "longitude": 0.0
      }
    ]
  },
  "Artist Name 2": {
    "onTour": false,
    "events": []
  }
}

Use the EXACT artist names provided as keys. If no tour dates found for an artist, return: {"onTour": false, "events": []}
Only include events in 2026. Only respond with valid JSON, no additional text or markdown.`;

    const result = await withTimeout(
      model.generateContent(prompt),
      30000, // 30 second timeout for AI generation
      "Batch tour status request timed out"
    );
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let geminiResponse: GeminiBatchResponse;
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
      console.error("Failed to parse Gemini batch response:", text, parseError);
      // Return empty response for all artists on parse error
      const emptyResponse: BatchTourStatusResponse = {};
      for (const artist of limitedArtists) {
        emptyResponse[artist] = { onTour: false, events: [] };
      }
      return NextResponse.json(emptyResponse);
    }

    // Process and filter events for each artist
    const batchResponse: BatchTourStatusResponse = {};

    for (const artist of limitedArtists) {
      // Try to find the artist response (case-insensitive)
      const artistData =
        geminiResponse[artist] ||
        Object.entries(geminiResponse).find(
          ([key]) => key.toLowerCase() === artist.toLowerCase()
        )?.[1];

      if (!artistData) {
        batchResponse[artist] = { onTour: false, events: [] };
        continue;
      }

      // Filter events by distance
      const eventsWithCoords: TourEvent[] = (artistData.events || []).map(
        (event) => ({
          date: event.date,
          venue: event.venue,
          city: event.city,
          latitude: event.latitude,
          longitude: event.longitude,
        })
      );

      const filteredEvents = filterEventsByDistance(
        eventsWithCoords,
        userLocation,
        DEFAULT_RADIUS_KM
      );

      batchResponse[artist] = {
        onTour: artistData.onTour || filteredEvents.length > 0,
        events: filteredEvents,
      };
    }

    return NextResponse.json(batchResponse, {
      headers: {
        'Cache-Control': 'private, max-age=21600', // 6 hours
      },
    });
  } catch (error) {
    console.error("Error fetching batch tour status:", error);
    // Return empty response on any error
    return NextResponse.json({} satisfies BatchTourStatusResponse);
  }
}
