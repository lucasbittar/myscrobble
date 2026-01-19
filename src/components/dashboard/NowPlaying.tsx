'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalCard, GlowText } from '@/components/crt';

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
  const { data, isLoading } = useQuery({
    queryKey: ['now-playing'],
    queryFn: fetchNowPlaying,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <TerminalCard title="now_playing.tsx" animate={false}>
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-terminal text-sm text-[#00ff41]"
          >
            SCANNING PLAYBACK...
          </motion.div>
        </div>
      </TerminalCard>
    );
  }

  if (!data?.is_playing || !data.item) {
    return (
      <TerminalCard title="now_playing.tsx" animate={false}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 text-4xl opacity-30">🎵</div>
          <p className="font-terminal text-sm text-[#555555]">
            Nothing playing right now
          </p>
          <p className="mt-1 font-mono text-xs text-[#333333]">
            Play something on Spotify to see it here
          </p>
        </div>
      </TerminalCard>
    );
  }

  const track = data.item;
  const progress = (data.progress_ms / track.duration_ms) * 100;
  const albumArt = track.album.images[0]?.url;

  return (
    <TerminalCard title="now_playing.tsx" glow animate={false}>
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex gap-4"
        >
          {/* Album art */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-[rgba(0,255,65,0.3)]">
            {albumArt && (
              <Image
                src={albumArt}
                alt={track.album.name}
                fill
                className="object-cover"
              />
            )}
            {/* Playing indicator */}
            <div className="absolute bottom-1 right-1 flex items-end gap-0.5">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-sm bg-[#00ff41]"
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
              <span className="font-terminal text-xs text-[#00ff41]">NOW PLAYING</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-[#00ff41]"
              />
            </div>

            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="truncate font-terminal text-lg text-[#e0e0e0] hover:text-[#00f5ff]">
                <GlowText color="phosphor" size="sm">
                  {track.name}
                </GlowText>
              </h3>
            </a>

            <p className="truncate font-mono text-sm text-[#888888]">
              {track.artists.map((a) => a.name).join(', ')}
            </p>

            <p className="truncate font-mono text-xs text-[#555555]">
              {track.album.name}
            </p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="relative h-1 overflow-hidden rounded-full bg-[rgba(0,255,65,0.2)]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-[#00ff41]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-xs text-[#555555]">
                <span>{formatTime(data.progress_ms)}</span>
                <span>{formatTime(track.duration_ms)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </TerminalCard>
  );
}
