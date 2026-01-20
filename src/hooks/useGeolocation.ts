"use client";

import { useState, useEffect, useCallback } from "react";
import { getDefaultLocation } from "@/lib/geo";
import type { GeoLocation } from "@/types/tour";

interface GeolocationState {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  requestPermission: () => void;
}

function getLocaleFromCookie(): string {
  if (typeof document === "undefined") return "en";
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("NEXT_LOCALE="));
  return cookie?.split("=")[1] || "en";
}

export function useGeolocation(): GeolocationState {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const setFallbackLocation = useCallback(() => {
    const locale = getLocaleFromCookie();
    const defaultLocation = getDefaultLocation(locale);
    setLocation(defaultLocation);
    setLoading(false);
  }, []);

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      setFallbackLocation();
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
        setPermissionDenied(false);
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        setError(err.message);
        setPermissionDenied(err.code === err.PERMISSION_DENIED);
        setFallbackLocation();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 60, // 1 hour cache
      }
    );
  }, [setFallbackLocation]);

  useEffect(() => {
    // Check if geolocation permission was previously granted
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            // Permission already granted, get location
            requestPermission();
          } else if (result.state === "denied") {
            // Permission denied, use fallback
            setPermissionDenied(true);
            setFallbackLocation();
          } else {
            // Permission prompt state, use fallback for now
            // User can manually request permission later
            setFallbackLocation();
          }
        })
        .catch(() => {
          // Permissions API not supported, try to get location
          requestPermission();
        });
    } else {
      // Permissions API not supported, try to get location
      requestPermission();
    }
  }, [requestPermission, setFallbackLocation]);

  return {
    location,
    loading,
    error,
    permissionDenied,
    requestPermission,
  };
}
