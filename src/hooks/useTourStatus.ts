"use client";

import { useQuery } from "@tanstack/react-query";
import type { TourStatusResponse, BatchTourStatusResponse } from "@/types/tour";

interface UseTourStatusOptions {
  artistName: string;
  lat?: number;
  lng?: number;
  enabled?: boolean;
}

// 24 hours in milliseconds
const STALE_TIME = 1000 * 60 * 60 * 24;
// 7 days in milliseconds
const GC_TIME = 1000 * 60 * 60 * 24 * 7;

async function fetchTourStatus(
  artistName: string,
  lat?: number,
  lng?: number
): Promise<TourStatusResponse> {
  const params = new URLSearchParams({ artist: artistName });
  if (lat !== undefined) params.append("lat", lat.toString());
  if (lng !== undefined) params.append("lng", lng.toString());

  const response = await fetch(`/api/tour-status?${params.toString()}`);
  if (!response.ok) {
    return { onTour: false, events: [] };
  }
  return response.json();
}

async function fetchBatchTourStatus(
  artists: string[],
  lat?: number,
  lng?: number
): Promise<BatchTourStatusResponse> {
  const response = await fetch("/api/tour-status/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artists, lat, lng }),
  });

  if (!response.ok) {
    // Return empty response for all artists on error
    const emptyResponse: BatchTourStatusResponse = {};
    for (const artist of artists) {
      emptyResponse[artist] = { onTour: false, events: [] };
    }
    return emptyResponse;
  }
  return response.json();
}

/**
 * Hook to fetch tour status for a single artist
 */
export function useTourStatus({
  artistName,
  lat,
  lng,
  enabled = true,
}: UseTourStatusOptions) {
  return useQuery({
    queryKey: ["tourStatus", artistName, lat, lng],
    queryFn: () => fetchTourStatus(artistName, lat, lng),
    enabled: enabled && !!artistName,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
  });
}

/**
 * Hook to fetch tour status for multiple artists in a single request
 */
export function useTourStatusBatch(
  artistNames: string[],
  lat?: number,
  lng?: number
) {
  return useQuery({
    queryKey: ["tourStatusBatch", artistNames, lat, lng],
    queryFn: () => fetchBatchTourStatus(artistNames, lat, lng),
    enabled: artistNames.length > 0,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
  });
}
