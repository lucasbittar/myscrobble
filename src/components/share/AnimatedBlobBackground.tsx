'use client';

import { ShareColorTheme, shareColorThemes } from './ShareContext';

interface AnimatedBlobBackgroundProps {
  theme?: ShareColorTheme;
  variant?: 'default' | 'vibrant' | 'subtle';
  className?: string;
}

// Premium blob configurations for light backgrounds
function generateBlobs(theme: ShareColorTheme, variant: 'default' | 'vibrant' | 'subtle') {
  const colors = shareColorThemes[theme];
  const intensity = variant === 'vibrant' ? 1 : variant === 'subtle' ? 0.5 : 0.7;

  return [
    // Top gradient wash
    {
      color: colors.from,
      size: 400,
      x: 100,
      y: -20,
      blur: 150,
      opacity: 0.15 * intensity,
    },
    // Center accent
    {
      color: colors.to,
      size: 300,
      x: 20,
      y: 50,
      blur: 120,
      opacity: 0.12 * intensity,
    },
    // Bottom accent
    {
      color: colors.from,
      size: 250,
      x: 80,
      y: 100,
      blur: 100,
      opacity: 0.1 * intensity,
    },
  ];
}

export function AnimatedBlobBackground({
  theme = 'green',
  variant = 'default',
  className = '',
}: AnimatedBlobBackgroundProps) {
  const blobs = generateBlobs(theme, variant);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)',
        }}
      />
      {blobs.map((blob, index) => (
        <div
          key={index}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            background: blob.color,
            filter: `blur(${blob.blur}px)`,
            opacity: blob.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

// Static version for html2canvas - premium light aesthetic
export function StaticBlobBackground({
  theme = 'green',
  variant = 'default',
}: AnimatedBlobBackgroundProps) {
  const colors = shareColorThemes[theme];
  const intensity = variant === 'vibrant' ? 1 : variant === 'subtle' ? 0.5 : 0.7;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
    >
      {/* Base: clean off-white */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#FAFBFC',
        }}
      />

      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, ${colors.from}08 0%, transparent 40%, ${colors.to}05 100%)`,
        }}
      />

      {/* Top-right accent glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          right: '-15%',
          top: '-20%',
          backgroundColor: colors.from,
          borderRadius: '50%',
          filter: 'blur(120px)',
          opacity: 0.12 * intensity,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom-left accent glow */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          left: '-10%',
          bottom: '-15%',
          backgroundColor: colors.to,
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.1 * intensity,
          pointerEvents: 'none',
        }}
      />

      {/* Center subtle accent */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.from,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.06 * intensity,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle noise texture overlay for premium feel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
