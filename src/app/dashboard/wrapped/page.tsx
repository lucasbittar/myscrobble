'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { getLargestImage } from '@/lib/spotify';
import {
  WrappedContainer,
  slideGradients,
  moodGradientOverrides,
  SlideLanding,
  SlideIntro,
  SlideTopArtist,
  MoodColor,
  GradientConfig,
} from '@/components/wrapped';

// Lazy load slides that appear later in the presentation
const SlideTopArtists = dynamic(() => import('@/components/wrapped/slides/SlideTopArtists').then(m => m.SlideTopArtists));
const SlideTopTrack = dynamic(() => import('@/components/wrapped/slides/SlideTopTrack').then(m => m.SlideTopTrack));
const SlideTopTracks = dynamic(() => import('@/components/wrapped/slides/SlideTopTracks').then(m => m.SlideTopTracks));
const SlideSonicAura = dynamic(() => import('@/components/wrapped/slides/SlideSonicAura').then(m => m.SlideSonicAura));
const SlideGenres = dynamic(() => import('@/components/wrapped/slides/SlideGenres').then(m => m.SlideGenres));
const SlideTimeListened = dynamic(() => import('@/components/wrapped/slides/SlideTimeListened').then(m => m.SlideTimeListened));
const SlidePatterns = dynamic(() => import('@/components/wrapped/slides/SlidePatterns').then(m => m.SlidePatterns));
const SlideSummary = dynamic(() => import('@/components/wrapped/slides/SlideSummary').then(m => m.SlideSummary));

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface WrappedData {
  topArtists: Array<{
    name: string;
    image: string;
    playCount?: number;
  }>;
  topTracks: Array<{
    name: string;
    artist: string;
    image: string;
  }>;
  topPodcasts: Array<{
    name: string;
    publisher: string;
    image: string;
  }>;
  topGenres: string[];
  stats: {
    uniqueArtists: number;
    uniqueTracks: number;
    totalTracks: number;
    totalMinutes: number;
  };
  listeningByHour: Array<{ hour: number; count: number }>;
  listeningByDay: Array<{ day: string; count: number }>;
}

interface MoodData {
  moodSentence: string;
  moodTags: string[];
  moodColor: MoodColor;
  emoji: string;
}

function getDateRange(timeRange: TimeRange): { start_date?: string; end_date?: string } {
  const now = new Date();
  switch (timeRange) {
    case 'short_term':
      const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      return { start_date: fourWeeksAgo.toISOString() };
    case 'medium_term':
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      return { start_date: sixMonthsAgo.toISOString() };
    case 'long_term':
    default:
      return {};
  }
}

async function fetchWrappedData(timeRange: TimeRange): Promise<WrappedData> {
  const dateRange = getDateRange(timeRange);
  const statsParams = new URLSearchParams();
  if (dateRange.start_date) statsParams.set('start_date', dateRange.start_date);
  if (dateRange.end_date) statsParams.set('end_date', dateRange.end_date);

  const [artistsRes, tracksRes, statsRes, podcastsRes] = await Promise.all([
    fetch(`/api/spotify/top-artists?time_range=${timeRange}&limit=10`),
    fetch(`/api/spotify/top-tracks?time_range=${timeRange}&limit=10`),
    fetch(`/api/stats?${statsParams.toString()}`),
    fetch('/api/spotify/saved-shows?limit=5'),
  ]);

  if (!artistsRes.ok || !tracksRes.ok) {
    throw new Error('Failed to fetch data');
  }

  const [artists, tracks, stats, podcasts] = await Promise.all([
    artistsRes.json(),
    tracksRes.json(),
    statsRes.ok ? statsRes.json() : null,
    podcastsRes.ok ? podcastsRes.json() : { items: [] },
  ]);

  const allGenres = artists.items?.flatMap((a: { genres: string[] }) => a.genres) || [];
  const genreCount = allGenres.reduce((acc: Record<string, number>, genre: string) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([genre]) => genre);

  return {
    topArtists: (artists.items || []).map((a: { name: string; images: { url: string }[] }) => ({
      name: a.name,
      image: a.images[0]?.url || '',
    })),
    topTracks: (tracks.items || []).map((t: { name: string; artists: { name: string }[]; album: { images: { url: string }[] } }) => ({
      name: t.name,
      artist: t.artists[0]?.name || '',
      image: t.album.images[0]?.url || '',
    })),
    topPodcasts: (podcasts.items || []).map((item: { show: { name: string; publisher: string; images: { url: string; width?: number; height?: number }[] } }) => ({
      name: item.show.name,
      publisher: item.show.publisher,
      image: getLargestImage(item.show.images) || '',
    })),
    topGenres,
    stats: {
      uniqueArtists: stats?.unique_artists || artists.items?.length || 0,
      uniqueTracks: stats?.unique_tracks || tracks.items?.length || 0,
      totalTracks: stats?.total_tracks || 0,
      totalMinutes: stats?.total_minutes || 0,
    },
    listeningByHour: stats?.listening_by_hour || [],
    listeningByDay: stats?.listening_by_day || [],
  };
}

async function fetchMoodAnalysis(): Promise<MoodData | null> {
  try {
    const res = await fetch('/api/ai/mood');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default function WrappedPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [isPlaying, setIsPlaying] = useState(false);
  const t = useTranslations('wrapped');
  const { data: session } = useSession();

  const timeRangeLabels: Record<TimeRange, string> = {
    short_term: t('timeRanges.short'),
    medium_term: t('timeRanges.medium'),
    long_term: t('timeRanges.long'),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['wrapped', timeRange],
    queryFn: () => fetchWrappedData(timeRange),
  });

  const { data: moodData, isLoading: isMoodLoading } = useQuery({
    queryKey: ['wrapped-mood'],
    queryFn: fetchMoodAnalysis,
    enabled: isPlaying,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const moodColor: MoodColor = moodData?.moodColor || 'experimental';

  // Build slides and gradients dynamically based on available data
  const { slides, gradients } = useMemo(() => {
    if (!data) return { slides: [], gradients: [] };

    const slideList: React.ReactNode[] = [];
    const gradientList: GradientConfig[] = [];

    // Slide 1: Intro
    slideList.push(
      <SlideIntro key="intro" timeRange={timeRangeLabels[timeRange]} />
    );
    gradientList.push(moodGradientOverrides[moodColor] || slideGradients.intro);

    // Slide 2: Top Artist (if available)
    if (data.topArtists[0]) {
      slideList.push(
        <SlideTopArtist key="topArtist" artist={data.topArtists[0]} />
      );
      gradientList.push(slideGradients.topArtist);
    }

    // Slide 3: Top Artists (if more than 1)
    if (data.topArtists.length > 1) {
      slideList.push(
        <SlideTopArtists key="topArtists" artists={data.topArtists} />
      );
      gradientList.push(slideGradients.topArtists);
    }

    // Slide 4: Top Track (if available)
    if (data.topTracks[0]) {
      slideList.push(
        <SlideTopTrack key="topTrack" track={data.topTracks[0]} />
      );
      gradientList.push(slideGradients.topTrack);
    }

    // Slide 5: Top Tracks (if more than 1)
    if (data.topTracks.length > 1) {
      slideList.push(
        <SlideTopTracks key="topTracks" tracks={data.topTracks} />
      );
      gradientList.push(slideGradients.topTracks);
    }

    // Slide 6: Sonic Aura
    slideList.push(
      <SlideSonicAura
        key="sonicAura"
        mood={moodData || null}
        isLoading={isMoodLoading}
        topGenre={data.topGenres[0]}
      />
    );
    gradientList.push(moodGradientOverrides[moodColor] || slideGradients.sonicAura);

    // Slide 7: Genres (if available)
    if (data.topGenres.length > 0) {
      slideList.push(
        <SlideGenres key="genres" genres={data.topGenres} />
      );
      gradientList.push(slideGradients.genres);
    }

    // Slide 8: Time Listened (if we have minutes data)
    if (data.stats.totalMinutes > 0) {
      slideList.push(
        <SlideTimeListened key="timeListened" totalMinutes={data.stats.totalMinutes} />
      );
      gradientList.push(slideGradients.timeListened);
    }

    // Slide 9: Listening Patterns (if we have data)
    if (data.listeningByHour.length > 0 || data.listeningByDay.length > 0) {
      slideList.push(
        <SlidePatterns
          key="patterns"
          byHour={data.listeningByHour}
          byDay={data.listeningByDay}
        />
      );
      gradientList.push(slideGradients.patterns);
    }

    // Slide 10: Summary
    slideList.push(
      <SlideSummary
        key="summary"
        stats={data.stats}
        podcastCount={data.topPodcasts.length}
        moodColor={moodColor}
        userName={session?.user?.name?.split(' ')[0]}
        onShare={() => {
          // Navigate to share page
          window.location.href = '/dashboard/share';
        }}
        onRestart={() => {
          setIsPlaying(false);
        }}
      />
    );
    gradientList.push(slideGradients.summary);

    return { slides: slideList, gradients: gradientList };
  }, [data, moodData, isMoodLoading, moodColor, timeRange, timeRangeLabels, session]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto rounded-full border-2 border-[#F59E0B] border-t-transparent"
          />
          <p className="text-xl font-bold text-[#F59E0B]">
            {t('loading')}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-white/10 backdrop-blur-sm rounded-2xl">
          <p className="text-xl font-medium text-red-400">{t('failed')}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Landing screen (before starting the presentation)
  if (!isPlaying) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] flex items-center justify-center">
        <SlideLanding
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onStart={() => setIsPlaying(true)}
          previewImage={data.topArtists[0]?.image}
        />
      </div>
    );
  }

  // Full-screen story experience
  return (
    <WrappedContainer
      gradients={gradients}
      onClose={() => setIsPlaying(false)}
    >
      {slides}
    </WrappedContainer>
  );
}
