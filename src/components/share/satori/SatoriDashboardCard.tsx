import { DashboardShareData } from '../share-types';
import { SatoriCardWrapper } from './SatoriCardWrapper';

interface ColorTheme {
  from: string;
  to: string;
  glow: string;
}

interface SatoriDashboardCardProps {
  data: DashboardShareData;
  colors: ColorTheme;
  backgroundImage?: string;
  t: {
    nowPlaying: string;
    myStats: string;
    timeListened: string;
    tracksPlayed: string;
    artists: string;
  };
}

export function SatoriDashboardCard({ data, colors, backgroundImage, t }: SatoriDashboardCardProps) {
  // Now Playing view
  if (data.nowPlaying) {
    return (
      <SatoriCardWrapper colors={colors} backgroundImage={backgroundImage}>
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
          <span
            style={{
              fontSize: 33,
              color: colors.from,
              marginBottom: 96,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600,
            }}
          >
            {t.nowPlaying}
          </span>

          {/* Album art with elegant shadow */}
          {data.nowPlaying.albumImage && (
            <div
              style={{
                width: 660,
                height: 660,
                marginBottom: 120,
                borderRadius: 48,
                overflow: 'hidden',
                display: 'flex',
                boxShadow: `0 72px 240px -36px ${colors.from}35, 0 24px 72px -24px rgba(0,0,0,0.15)`,
                backgroundColor: `${colors.from}15`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.nowPlaying.albumImage}
                alt={data.nowPlaying.trackName}
                width={660}
                height={660}
                style={{
                  width: 660,
                  height: 660,
                }}
              />
            </div>
          )}

          {/* Track name */}
          <span
            style={{
              fontSize: 78,
              fontWeight: 700,
              marginBottom: 36,
              color: '#0a0a0a',
              lineHeight: 1.2,
              padding: '0 48px',
            }}
          >
            {data.nowPlaying.trackName}
          </span>

          {/* Artist name with accent color */}
          <span
            style={{
              fontSize: 51,
              color: colors.from,
              fontWeight: 500,
            }}
          >
            {data.nowPlaying.artistName}
          </span>
        </div>
      </SatoriCardWrapper>
    );
  }

  // Stats view
  if (data.stats) {
    const hours = Math.floor(data.stats.totalMinutes / 60);
    const minutes = data.stats.totalMinutes % 60;

    return (
      <SatoriCardWrapper colors={colors} backgroundImage={backgroundImage}>
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
          <span
            style={{
              fontSize: 33,
              color: colors.from,
              marginBottom: 144,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600,
            }}
          >
            {t.myStats}
          </span>

          {/* Stats grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 120 }}>
            {/* Time listened - hero stat */}
            {data.stats.totalMinutes > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 168,
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                    backgroundClip: 'text',
                    color: 'transparent',
                    lineHeight: 1,
                  }}
                >
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                </span>
                <span
                  style={{
                    marginTop: 36,
                    fontSize: 36,
                    color: '#6a6a6a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 500,
                  }}
                >
                  {t.timeListened}
                </span>
              </div>
            )}

            {/* Secondary stats row */}
            <div style={{ display: 'flex', gap: 144, justifyContent: 'center' }}>
              {data.stats.totalTracks > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 108,
                      fontWeight: 700,
                      color: '#0a0a0a',
                    }}
                  >
                    {data.stats.totalTracks.toLocaleString()}
                  </span>
                  <span
                    style={{
                      marginTop: 24,
                      fontSize: 33,
                      color: '#8a8a8a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {t.tracksPlayed}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 108,
                    fontWeight: 700,
                    color: '#0a0a0a',
                  }}
                >
                  {data.stats.uniqueArtists}
                </span>
                <span
                  style={{
                    marginTop: 24,
                    fontSize: 33,
                    color: '#8a8a8a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {t.artists}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SatoriCardWrapper>
    );
  }

  // Fallback
  return (
    <SatoriCardWrapper colors={colors} backgroundImage={backgroundImage}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#6a6a6a', fontSize: 48 }}>No data available</span>
      </div>
    </SatoriCardWrapper>
  );
}
