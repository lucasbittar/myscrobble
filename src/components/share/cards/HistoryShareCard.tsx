'use client';

import { useTranslations } from 'next-intl';
import { ShareCardWrapper } from './ShareCardWrapper';
import { HistoryShareData, ShareColorTheme, shareColorThemes } from '../ShareContext';

interface HistoryShareCardProps {
  data: HistoryShareData;
  theme?: ShareColorTheme;
}

export function HistoryShareCard({ data, theme = 'green' }: HistoryShareCardProps) {
  const t = useTranslations('contextualShare');
  const colors = shareColorThemes[theme];

  // Get first 5 tracks for the list (reduced from 6)
  const tracks = data.recentTracks.slice(0, 5);

  return (
    <ShareCardWrapper theme={theme} variant="subtle">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p
            style={{
              fontSize: '11px',
              color: colors.from,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600,
            }}
          >
            {t('cards.recentVibes')}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: '#8a8a8a',
            }}
          >
            {data.recentTracks.length} {t('cards.tracksRecently')}
          </p>
        </div>

        {/* Track list - editorial style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tracks.map((track, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 14px',
                borderRadius: '14px',
                backgroundColor: index === 0 ? `${colors.from}08` : 'transparent',
                border: index === 0 ? `1px solid ${colors.from}15` : '1px solid transparent',
              }}
            >
              {/* Rank number */}
              <span
                style={{
                  width: '18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: index === 0 ? colors.from : '#bbb',
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>

              {/* Album art - using img tag directly for better html2canvas compatibility */}
              <div
                style={{
                  width: index === 0 ? '52px' : '44px',
                  height: index === 0 ? '52px' : '44px',
                  flexShrink: 0,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: index === 0
                    ? `0 6px 20px -4px ${colors.from}30`
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  backgroundColor: `${colors.from}15`,
                }}
              >
                {track.albumImage ? (
                  <img
                    src={track.albumImage}
                    alt={track.trackName}
                    width={index === 0 ? 52 : 44}
                    height={index === 0 ? 52 : 44}
                    style={{
                      display: 'block',
                      width: index === 0 ? '52px' : '44px',
                      height: index === 0 ? '52px' : '44px',
                    }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${colors.from}20 0%, ${colors.to}20 100%)`,
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🎵</span>
                  </div>
                )}
              </div>

              {/* Track info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    fontWeight: 600,
                    color: '#0a0a0a',
                    fontSize: index === 0 ? '14px' : '13px',
                    marginBottom: '2px',
                    lineHeight: 1.2,
                  }}
                >
                  {track.trackName}
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: index === 0 ? colors.from : '#6a6a6a',
                    fontWeight: index === 0 ? 500 : 400,
                    lineHeight: 1.2,
                  }}
                >
                  {track.artistName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ShareCardWrapper>
  );
}
