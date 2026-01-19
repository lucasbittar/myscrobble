'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GlowText, TerminalCard, TerminalButton, TerminalInput } from '@/components/crt';

interface Concert {
  id: string;
  artist: string;
  venue: {
    name: string;
    city: string;
    region: string;
    country: string;
  };
  datetime: string;
  url: string;
  lineup: string[];
}

interface ConcertsResponse {
  concerts: Concert[];
  artists: string[];
}

async function fetchConcerts(location?: string): Promise<ConcertsResponse> {
  const params = new URLSearchParams();
  if (location) params.set('location', location);

  const res = await fetch(`/api/concerts?${params}`);
  if (!res.ok) throw new Error('Failed to fetch concerts');
  return res.json();
}

export default function ConcertsPage() {
  const [location, setLocation] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['concerts', searchLocation],
    queryFn: () => fetchConcerts(searchLocation),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleSearch = () => {
    setSearchLocation(location);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-terminal text-3xl">
          <GlowText color="magenta" size="sm">
            <span className="text-[#888888]">♪</span> Concerts
          </GlowText>
        </h1>
        <p className="mt-1 font-mono text-sm text-[#888888]">
          Upcoming shows from your favorite artists
        </p>
      </motion.div>

      {/* Location Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <div className="flex-1">
          <TerminalInput
            placeholder="Enter city or location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <TerminalButton onClick={handleSearch} disabled={isLoading}>
          Search
        </TerminalButton>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-lg border border-[rgba(255,0,255,0.2)] bg-[rgba(255,0,255,0.05)] p-4"
      >
        <p className="font-mono text-xs text-[#ff00ff]">
          <span className="font-bold">NOTE:</span> Concert data requires a Bandsintown API key.
          Configure BANDSINTOWN_APP_ID in your environment variables.
        </p>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-4 text-4xl"
          >
            ♪
          </motion.div>
          <p className="font-terminal text-[#ff00ff]">Finding concerts...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <TerminalCard>
          <div className="py-8 text-center">
            <p className="mb-4 font-terminal text-[#ff4444]">
              Failed to load concerts
            </p>
            <p className="font-mono text-xs text-[#888888]">
              Make sure your Bandsintown API key is configured
            </p>
          </div>
        </TerminalCard>
      )}

      {/* Empty State */}
      {data && data.concerts.length === 0 && !isLoading && (
        <TerminalCard>
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl opacity-30">🎤</div>
            <p className="font-terminal text-[#888888]">
              No upcoming concerts found
            </p>
            <p className="mt-2 font-mono text-xs text-[#555555]">
              Try a different location or check back later
            </p>
          </div>
        </TerminalCard>
      )}

      {/* Concerts List */}
      {data && data.concerts.length > 0 && !isLoading && (
        <>
          {/* Artists being tracked */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="mb-4 font-mono text-xs text-[#888888]">
              <span className="text-[#ff00ff]">Tracking:</span> {data.artists.join(', ')}
            </p>
          </motion.div>

          {/* Concert Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {data.concerts.map((concert, index) => (
              <motion.div
                key={concert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <TerminalCard className="h-full">
                  <div className="space-y-3">
                    {/* Artist */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-terminal text-lg text-[#ff00ff]">
                        {concert.artist}
                      </h3>
                      <span className="rounded-full bg-[rgba(255,0,255,0.2)] px-2 py-0.5 font-terminal text-xs text-[#ff00ff]">
                        ON TOUR
                      </span>
                    </div>

                    {/* Venue */}
                    <div>
                      <p className="font-terminal text-sm text-[#e0e0e0]">
                        {concert.venue.name}
                      </p>
                      <p className="font-mono text-xs text-[#888888]">
                        {concert.venue.city}, {concert.venue.region || concert.venue.country}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-terminal text-[#00f5ff]">
                          {new Date(concert.datetime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="font-mono text-xs text-[#555555]">
                          {new Date(concert.datetime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <a
                        href={concert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <TerminalButton variant="secondary" size="sm">
                          Tickets
                        </TerminalButton>
                      </a>
                    </div>

                    {/* Lineup */}
                    {concert.lineup.length > 1 && (
                      <p className="font-mono text-xs text-[#555555]">
                        With: {concert.lineup.slice(1).join(', ')}
                      </p>
                    )}
                  </div>
                </TerminalCard>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
