'use client';

import { useCallback, useState } from 'react';
import { ShareCardType, ShareColorTheme, ShareData } from '../share-types';

interface UseShareImageOptions {
  fileName?: string;
}

interface UseShareImageReturn {
  isDownloading: boolean;
  downloadImage: () => Promise<void>;
}

interface UseShareImageParams {
  type: ShareCardType;
  data: ShareData['data'];
  theme?: ShareColorTheme;
  locale?: string;
}

export function useShareImage(
  params: UseShareImageParams,
  options: UseShareImageOptions = {}
): UseShareImageReturn {
  const { fileName = 'myscrobble-share' } = options;
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = useCallback(async () => {
    setIsDownloading(true);
    try {
      // Call the server-side API to generate the image using Satori
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

      // Get the image blob from the response
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [params.type, params.data, params.theme, params.locale, fileName]);

  return {
    isDownloading,
    downloadImage,
  };
}
