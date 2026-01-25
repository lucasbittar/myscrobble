'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ModernCard } from '@/components/modern';

interface NowPlayingData {
  is_playing: boolean;
  item: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    duration_ms: number;
    external_urls: { spotify: string };
  } | null;
  progress_ms: number;
}

async function fetchNowPlaying(): Promise<NowPlayingData | null> {
  const res = await fetch('/api/spotify/now-playing');
  if (!res.ok) return null;
  return res.json();
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function NowPlaying() {
  const t = useTranslations('dashboard.nowPlaying');
  const { data, isLoading } = useQuery({
    queryKey: ['now-playing'],
    queryFn: fetchNowPlaying,
    refetchInterval: 30000, // Refresh every 30 seconds to reduce API load
  });

  if (isLoading) {
    return (
      <ModernCard>
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm font-medium text-primary"
          >
            Scanning playback...
          </motion.div>
        </div>
      </ModernCard>
    );
  }

  if (!data?.is_playing || !data.item) {
    return (
      <ModernCard>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 text-4xl opacity-30">🎵</div>
          <p className="text-sm font-medium text-muted-foreground">
            {t('notPlaying')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {t('hint')}
          </p>
        </div>
      </ModernCard>
    );
  }

  const track = data.item;
  const progress = (data.progress_ms / track.duration_ms) * 100;
  const albumArt = track.album.images[0]?.url;

  return (
    <ModernCard className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex gap-4"
        >
          {/* Album art */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl shadow-soft">
            {albumArt && (
              <Image
                src={albumArt}
                alt={track.album.name}
                fill
                className="object-cover"
              />
            )}
            {/* Playing indicator */}
            <div className="absolute bottom-1.5 right-1.5 flex items-end gap-0.5">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-sm bg-primary"
                  animate={{ height: ['4px', '12px', '4px'] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium text-primary uppercase">{t('title')}</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            </div>

            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="truncate text-lg font-semibold text-foreground hover:text-primary transition-colors">
                {track.name}
              </h3>
            </a>

            <p className="truncate text-sm text-muted-foreground">
              {track.artists.map((a) => a.name).join(', ')}
            </p>

            <p className="truncate text-xs text-muted-foreground/70">
              {track.album.name}
            </p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="relative h-1.5 overflow-hidden rounded-full bg-primary/20">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(data.progress_ms)}</span>
                <span>{formatTime(track.duration_ms)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </ModernCard>
  );
}
