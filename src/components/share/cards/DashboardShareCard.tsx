'use client';

import { useTranslations } from 'next-intl';
import { ShareCardWrapper } from './ShareCardWrapper';
import { DashboardShareData, ShareColorTheme, shareColorThemes } from '../ShareContext';

interface DashboardShareCardProps {
  data: DashboardShareData;
  theme?: ShareColorTheme;
}

export function DashboardShareCard({ data, theme = 'green' }: DashboardShareCardProps) {
  const t = useTranslations('contextualShare');
  const colors = shareColorThemes[theme];

  // If now playing, show that; otherwise show stats
  if (data.nowPlaying) {
    return (
      <ShareCardWrapper theme={theme}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {/* Label */}
          <p
            style={{
              fontSize: '11px',
              color: colors.from,
              marginBottom: '32px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600,
            }}
          >
            {t('cards.nowPlaying')}
          </p>

          {/* Album art with elegant shadow - using img tag for html2canvas compatibility */}
          {data.nowPlaying.albumImage && (
            <div
              style={{
                width: '220px',
                height: '220px',
                marginBottom: '40px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: `0 24px 80px -12px ${colors.from}35, 0 8px 24px -8px rgba(0,0,0,0.15)`,
                backgroundColor: `${colors.from}15`,
              }}
            >
              <img
                src={data.nowPlaying.albumImage}
                alt={data.nowPlaying.trackName}
                width={220}
                height={220}
                style={{
                  display: 'block',
                  width: '220px',
                  height: '220px',
                }}
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Track name */}
          <h2
            style={{
              fontSize: '26px',
              fontWeight: 700,
              marginBottom: '12px',
              color: '#0a0a0a',
              lineHeight: 1.2,
              padding: '0 16px',
            }}
          >
            {data.nowPlaying.trackName}
          </h2>

          {/* Artist name with accent color */}
          <p
            style={{
              fontSize: '17px',
              color: colors.from,
              fontWeight: 500,
            }}
          >
            {data.nowPlaying.artistName}
          </p>
        </div>
      </ShareCardWrapper>
    );
  }

  // Stats view
  if (data.stats) {
    const hours = Math.floor(data.stats.totalMinutes / 60);
    const minutes = data.stats.totalMinutes % 60;

    return (
      <ShareCardWrapper theme={theme}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {/* Label */}
          <p
            style={{
              fontSize: '11px',
              color: colors.from,
              marginBottom: '48px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600,
            }}
          >
            {t('cards.myStats')}
          </p>

          {/* Stats grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Time listened - hero stat */}
            {data.stats.totalMinutes > 0 && (
              <div>
                <p
                  style={{
                    fontSize: '56px',
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                  }}
                >
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                </p>
                <p
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#6a6a6a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 500,
                  }}
                >
                  {t('cards.timeListened')}
                </p>
              </div>
            )}

            {/* Secondary stats row */}
            <div style={{ display: 'flex', gap: '48px', justifyContent: 'center' }}>
              {data.stats.totalTracks > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: '36px',
                      fontWeight: 700,
                      color: '#0a0a0a',
                    }}
                  >
                    {data.stats.totalTracks.toLocaleString()}
                  </p>
                  <p
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#8a8a8a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {t('cards.tracksPlayed')}
                  </p>
                </div>
              )}

              <div>
                <p
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#0a0a0a',
                  }}
                >
                  {data.stats.uniqueArtists}
                </p>
                <p
                  style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#8a8a8a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {t('cards.artists')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ShareCardWrapper>
    );
  }

  return null;
}
