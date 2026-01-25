'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { ShareCardType, ShareColorTheme, ShareData } from '../share-types';

interface UseShareImageOptions {
  fileName?: string;
}

interface UseShareImageReturn {
  isDownloading: boolean;
  isPreGenerating: boolean;
  canNativeShare: boolean;
  error: string | null;
  downloadImage: () => Promise<void>;
  shareImage: () => Promise<void>;
}

interface UseShareImageParams {
  type: ShareCardType;
  data: ShareData['data'];
  theme?: ShareColorTheme;
  locale?: string;
}

/**
 * Check if the device is mobile (for native share)
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for touch capability and mobile user agent
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(navigator.userAgent);

  return hasTouchScreen && isMobileUA;
}

/**
 * Check if the device supports native sharing with files
 * Only returns true on mobile devices to avoid user gesture issues on desktop
 */
function checkNativeShareSupport(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Only use native share on mobile devices
  if (!isMobileDevice()) return false;

  if (!navigator.share) return false;
  if (!navigator.canShare) return false;

  // Check if file sharing is supported by testing with a dummy file
  try {
    const testFile = new File(['test'], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

export function useShareImage(
  params: UseShareImageParams,
  options: UseShareImageOptions = {}
): UseShareImageReturn {
  const { fileName = 'myscrobble-share' } = options;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreGenerating, setIsPreGenerating] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for pre-generated blob
  const cachedBlobRef = useRef<Blob | null>(null);
  const cacheKeyRef = useRef<string>('');

  // Check for native share support on mount (client-side only)
  useEffect(() => {
    setCanNativeShare(checkNativeShareSupport());
  }, []);

  // Create a cache key from params
  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      type: params.type,
      data: params.data,
      theme: params.theme,
      locale: params.locale,
    });
  }, [params.type, params.data, params.theme, params.locale]);

  // Pre-generate image when modal opens (params change)
  useEffect(() => {
    const currentKey = getCacheKey();

    // Skip if already cached with same params
    if (cacheKeyRef.current === currentKey && cachedBlobRef.current) {
      return;
    }

    // Skip if no data
    if (!params.data || Object.keys(params.data).length === 0) {
      return;
    }

    const preGenerate = async () => {
      setIsPreGenerating(true);
      try {
        const response = await fetch('/api/share/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: params.type,
            data: params.data,
            theme: params.theme,
            locale: params.locale,
          }),
        });

        if (response.ok) {
          cachedBlobRef.current = await response.blob();
          cacheKeyRef.current = currentKey;
        }
      } catch (err) {
        console.log('Pre-generation failed, will generate on demand:', err);
      } finally {
        setIsPreGenerating(false);
      }
    };

    preGenerate();
  }, [getCacheKey, params.type, params.data, params.theme, params.locale]);

  // Generate image blob from API (uses cache if available)
  const generateImageBlob = useCallback(async (): Promise<Blob> => {
    // Use cached blob if available and params match
    const currentKey = getCacheKey();
    if (cachedBlobRef.current && cacheKeyRef.current === currentKey) {
      return cachedBlobRef.current;
    }

    // Otherwise generate fresh
    const response = await fetch('/api/share/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: params.type,
        data: params.data,
        theme: params.theme,
        locale: params.locale,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const blob = await response.blob();

    // Cache it for future use
    cachedBlobRef.current = blob;
    cacheKeyRef.current = currentKey;

    return blob;
  }, [params.type, params.data, params.theme, params.locale, getCacheKey]);

  // Download image (fallback for desktop)
  const downloadImage = useCallback(async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const blob = await generateImageBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [generateImageBlob, fileName]);

  // Share image using native Web Share API (mobile)
  // Falls back to download if native share fails
  const shareImage = useCallback(async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const blob = await generateImageBlob();

      // Create a File object from the blob
      const file = new File([blob], `${fileName}-${Date.now()}.png`, {
        type: 'image/png',
      });

      try {
        // Try native share first
        await navigator.share({
          files: [file],
          title: 'MyScrobble',
          text: 'Check out my music stats!',
        });
      } catch (shareErr) {
        // If user cancelled, don't do anything
        if (shareErr instanceof Error && shareErr.name === 'AbortError') {
          return;
        }

        // For NotAllowedError or other share failures, fall back to download
        console.log('Native share failed, falling back to download:', shareErr);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [generateImageBlob, fileName]);

  return {
    isDownloading,
    isPreGenerating,
    canNativeShare,
    error,
    downloadImage,
    shareImage,
  };
}
