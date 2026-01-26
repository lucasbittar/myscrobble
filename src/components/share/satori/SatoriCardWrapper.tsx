import { ReactNode } from 'react';
import { SatoriBackground } from './SatoriBackground';

interface ColorTheme {
  from: string;
  to: string;
  glow: string;
}

interface SatoriCardWrapperProps {
  children: ReactNode;
  colors: ColorTheme;
  variant?: 'default' | 'vibrant' | 'subtle';
  backgroundImage?: string;
}

export function SatoriCardWrapper({
  children,
  colors,
  variant = 'default',
  backgroundImage,
}: SatoriCardWrapperProps) {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#FAFBFC',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background - use pre-generated image if available, otherwise dynamic */}
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt=""
          width={1080}
          height={1920}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1080,
            height: 1920,
            objectFit: 'cover',
          }}
        />
      ) : (
        <SatoriBackground colors={colors} variant={variant} />
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '144px 96px 72px',
          color: '#0a0a0a',
        }}
      >
        {children}
      </div>

      {/* Footer with branding */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '72px 96px 120px',
        }}
      >
        {/* Subtle divider line */}
        <div
          style={{
            width: 180,
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${colors.from}40 50%, transparent 100%)`,
            marginBottom: 48,
          }}
        />
        <span
          style={{
            fontSize: 39,
            fontWeight: 500,
            color: '#8a8a8a',
            letterSpacing: '0.05em',
          }}
        >
          MyScrobble.fm
        </span>
      </div>
    </div>
  );
}
