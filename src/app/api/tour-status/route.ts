import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  filterEventsByDistance,
  getDefaultLocation,
  getLocationForSearch,
  DEFAULT_RADIUS_KM,
} from "@/lib/geo";
import type { TourStatusResponse, TourEvent } from "@/types/tour";

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

interface GeminiResponse {
  onTour: boolean;
  events: GeminiEvent[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get("artist");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    if (!artist) {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }

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

    const prompt = `Search for upcoming 2026 concert tour dates for the artist "${artist}".

Search terms to use: ${searchTerms}
Focus on events in ${countryHint}, specifically in or near ${locationName}.

Return ONLY a valid JSON object:
{
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
}

If no tour dates found, return: {"onTour": false, "events": []}
Only include events in 2026. Only respond with valid JSON, no additional text or markdown.`;

    const result = await model.generateContent(prompt);
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
      // Return empty response on parse error
      return NextResponse.json({
        onTour: false,
        events: [],
      } satisfies TourStatusResponse);
    }

    // Filter events by distance
    const eventsWithCoords: TourEvent[] = geminiResponse.events.map((event) => ({
      date: event.date,
      venue: event.venue,
      city: event.city,
      latitude: event.latitude,
      longitude: event.longitude,
    }));

    const filteredEvents = filterEventsByDistance(
      eventsWithCoords,
      userLocation,
      DEFAULT_RADIUS_KM
    );

    const tourResponse: TourStatusResponse = {
      onTour: geminiResponse.onTour || filteredEvents.length > 0,
      events: filteredEvents,
    };

    return NextResponse.json(tourResponse);
  } catch (error) {
    console.error("Error fetching tour status:", error);
    // Return empty response on any error
    return NextResponse.json({
      onTour: false,
      events: [],
    } satisfies TourStatusResponse);
  }
}
