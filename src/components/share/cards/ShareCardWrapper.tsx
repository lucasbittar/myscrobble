'use client';

import { ReactNode } from 'react';
import { StaticBlobBackground } from '../AnimatedBlobBackground';
import { ShareColorTheme, shareColorThemes } from '../ShareContext';

interface ShareCardWrapperProps {
  children: ReactNode;
  theme?: ShareColorTheme;
  variant?: 'default' | 'vibrant' | 'subtle';
}

export function ShareCardWrapper({
  children,
  theme = 'green',
  variant = 'default',
}: ShareCardWrapperProps) {
  const colors = shareColorThemes[theme];

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{
        backgroundColor: '#FAFBFC',
        color: '#0a0a0a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background with blobs */}
      <StaticBlobBackground theme={theme} variant={variant} />

      {/* Content */}
      <div
        className="relative z-10 flex-1 flex flex-col"
        style={{
          padding: '48px 32px 24px',
          color: '#0a0a0a',
        }}
      >
        {children}
      </div>

      {/* Footer with branding - refined minimal style */}
      <div
        className="relative z-10"
        style={{
          padding: '24px 32px 40px',
          textAlign: 'center',
        }}
      >
        {/* Subtle divider line */}
        <div
          style={{
            width: '60px',
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${colors.from}40 50%, transparent 100%)`,
            margin: '0 auto 16px',
          }}
        />
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#8a8a8a',
            letterSpacing: '0.05em',
          }}
        >
          MyScrobble.fm
        </p>
      </div>
    </div>
  );
}
