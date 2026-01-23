'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Localized content
const content = {
  en: {
    tagline: 'Your Spotify Dashboard',
    subtitle: 'AI Recommendations · Concert Discovery · Beautiful Insights',
  },
  'pt-BR': {
    tagline: 'Seu Painel do Spotify',
    subtitle: 'Recomendações com IA · Descoberta de Shows · Insights Visuais',
  },
};

// Static flowing shape for OG image (no animations - needs to be screenshot-ready)
function FlowingShapeStatic({
  className,
  gradient,
  opacity = 1,
}: {
  className?: string;
  gradient: 'purple-pink' | 'teal-blue' | 'spotify' | 'warm' | 'blue-cyan';
  opacity?: number;
}) {
  const gradientId = `og-grad-${gradient}-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={className} style={{ opacity }}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradient === 'purple-pink' && (
              <>
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </>
            )}
            {gradient === 'teal-blue' && (
              <>
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </>
            )}
            {gradient === 'spotify' && (
              <>
                <stop offset="0%" stopColor="#1DB954" />
                <stop offset="100%" stopColor="#14B8A6" />
              </>
            )}
            {gradient === 'warm' && (
              <>
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#EC4899" />
              </>
            )}
            {gradient === 'blue-cyan' && (
              <>
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#14B8A6" />
              </>
            )}
          </linearGradient>
        </defs>
        <path
          d="M40,-62.6C52.2,-54.5,62.9,-43.9,69.8,-31.1C76.7,-18.3,79.8,-3.3,77.5,10.8C75.2,24.9,67.4,38.1,56.7,48.1C46,58.1,32.4,64.9,17.8,69.1C3.2,73.3,-12.4,74.9,-26.6,70.9C-40.8,66.9,-53.6,57.3,-63.1,45C-72.6,32.7,-78.8,17.7,-79.5,2.1C-80.2,-13.5,-75.4,-29.7,-66.1,-42.3C-56.8,-54.9,-43,-64,-28.8,-70.4C-14.6,-76.8,0,-80.5,13.8,-77.4C27.6,-74.3,27.8,-70.7,40,-62.6Z"
          transform="translate(100 100)"
          fill={`url(#${gradientId})`}
        />
      </svg>
    </div>
  );
}

// Feature icon components
function StatsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19l1 3 3-1-1-3-3 1z" />
      <path d="M19 19l-1 3-3-1 1-3 3 1z" />
    </svg>
  );
}

function ConcertsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="8" y="6" width="8" height="12" rx="4" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
      <path d="M3 11c0-1 1-2 2-2" />
      <path d="M19 11c0-1-1-2-2-2" />
      <path d="M1 11c0-2 2-4 4-4" />
      <path d="M23 11c0-2-2-4-4-4" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="2" />
      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function OGPreviewContent() {
  const searchParams = useSearchParams();
  const locale = (searchParams.get('locale') as 'en' | 'pt-BR') || 'en';
  const t = content[locale] || content.en;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 50%, #e8e8e8 100%)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Flowing shape blobs - positioned for visual impact */}

      {/* Large purple-pink blob - top right, the hero blob */}
      <FlowingShapeStatic
        className="absolute -top-32 -right-20 w-[600px] h-[600px]"
        gradient="purple-pink"
        opacity={0.35}
      />

      {/* Spotify green blob - bottom left */}
      <FlowingShapeStatic
        className="absolute -bottom-40 -left-32 w-[500px] h-[500px]"
        gradient="spotify"
        opacity={0.3}
      />

      {/* Warm blob - center right, overlapping */}
      <FlowingShapeStatic
        className="absolute top-1/3 -right-16 w-[350px] h-[350px]"
        gradient="warm"
        opacity={0.25}
      />

      {/* Teal-blue blob - bottom center */}
      <FlowingShapeStatic
        className="absolute -bottom-20 left-1/3 w-[400px] h-[400px]"
        gradient="teal-blue"
        opacity={0.2}
      />

      {/* Small accent blob - top left */}
      <FlowingShapeStatic
        className="absolute -top-16 left-20 w-[200px] h-[200px]"
        gradient="blue-cyan"
        opacity={0.15}
      />

      {/* Main content container */}
      <div className="relative z-10 h-full flex flex-col justify-center px-20">

        {/* Glass card container */}
        <div
          className="relative max-w-[800px]"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '48px 56px',
          }}
        >
          {/* Brand name */}
          <div className="flex items-baseline gap-2 mb-6">
            <span
              style={{
                fontSize: '72px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#0a0a0a',
                lineHeight: 1,
              }}
            >
              MyScrobble
            </span>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 500,
                color: '#666',
                marginLeft: '4px',
              }}
            >
              .fm
            </span>
          </div>

          {/* Tagline with gradient accent */}
          <div className="mb-8">
            <span
              style={{
                fontSize: '28px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1DB954 0%, #8B5CF6 50%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.tagline}
            </span>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '18px',
              color: '#666',
              letterSpacing: '0.02em',
              marginBottom: '32px',
            }}
          >
            {t.subtitle}
          </p>

          {/* Feature pills */}
          <div className="flex gap-3">
            {[
              { icon: <StatsIcon />, color: '#1DB954' },
              { icon: <AIIcon />, color: '#8B5CF6' },
              { icon: <ConcertsIcon />, color: '#EC4899' },
              { icon: <ShareIcon />, color: '#F59E0B' },
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: `${feature.color}15`,
                  color: feature.color,
                  border: `1px solid ${feature.color}30`,
                }}
              >
                {feature.icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative corner accent - bottom right */}
      <div
        className="absolute bottom-8 right-8 flex items-center gap-3"
        style={{ opacity: 0.6 }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#1DB954',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#8B5CF6',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#EC4899',
          }}
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#F59E0B',
          }}
        />
      </div>

      {/* Spotify logo hint - very subtle */}
      <div
        className="absolute bottom-8 left-8 flex items-center gap-2"
        style={{ opacity: 0.4 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span style={{ fontSize: '13px', color: '#888', letterSpacing: '0.05em' }}>
          POWERED BY SPOTIFY
        </span>
      </div>
    </div>
  );
}

export default function OGPreviewPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-8">
      {/* Container showing the OG image with guides */}
      <div className="relative">
        {/* Dimension label */}
        <div className="absolute -top-8 left-0 text-neutral-500 text-sm font-mono">
          1200 × 630px — Screenshot this area
        </div>

        {/* The actual OG preview */}
        <div className="shadow-2xl rounded-lg overflow-hidden">
          <Suspense fallback={
            <div style={{ width: '1200px', height: '630px', background: '#fafafa' }} />
          }>
            <OGPreviewContent />
          </Suspense>
        </div>

        {/* URL hints */}
        <div className="absolute -bottom-12 left-0 text-neutral-600 text-sm font-mono">
          <span className="text-neutral-500">?locale=</span>
          <span className="text-green-400">en</span>
          <span className="text-neutral-500"> | </span>
          <span className="text-purple-400">pt-BR</span>
        </div>
      </div>
    </div>
  );
}
