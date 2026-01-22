import { HistoryShareData } from '../share-types';
import { SatoriCardWrapper } from './SatoriCardWrapper';

interface ColorTheme {
  from: string;
  to: string;
  glow: string;
}

interface SatoriHistoryCardProps {
  data: HistoryShareData;
  colors: ColorTheme;
  t: {
    recentVibes: string;
    tracksRecently: string;
  };
}

export function SatoriHistoryCard({ data, colors, t }: SatoriHistoryCardProps) {
  // Get first 5 tracks for the list
  const tracks = data.recentTracks.slice(0, 5);

  return (
    <SatoriCardWrapper colors={colors} variant="subtle">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 84 }}>
          <span
            style={{
              fontSize: 33,
              color: colors.from,
              marginBottom: 24,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600,
            }}
          >
            {t.recentVibes}
          </span>
          <span
            style={{
              fontSize: 39,
              color: '#8a8a8a',
            }}
          >
            {data.recentTracks.length} {t.tracksRecently}
          </span>
        </div>

        {/* Track list - editorial style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {tracks.map((track, index) => {
            const isFirst = index === 0;
            const imgSize = isFirst ? 156 : 132;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 42,
                  padding: '30px 42px',
                  borderRadius: 42,
                  backgroundColor: isFirst ? `${colors.from}08` : 'transparent',
                  border: isFirst ? `3px solid ${colors.from}15` : '3px solid transparent',
                }}
              >
                {/* Rank number */}
                <span
                  style={{
                    width: 54,
                    fontSize: 39,
                    fontWeight: 700,
                    color: isFirst ? colors.from : '#bbb',
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                {/* Album art */}
                <div
                  style={{
                    width: imgSize,
                    height: imgSize,
                    flexShrink: 0,
                    borderRadius: 24,
                    overflow: 'hidden',
                    display: 'flex',
                    boxShadow: isFirst
                      ? `0 18px 60px -12px ${colors.from}30`
                      : '0 6px 24px rgba(0,0,0,0.08)',
                    backgroundColor: `${colors.from}15`,
                  }}
                >
                  {track.albumImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={track.albumImage}
                      alt={track.trackName}
                      width={imgSize}
                      height={imgSize}
                      style={{
                        width: imgSize,
                        height: imgSize,
                      }}
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
                      <span style={{ fontSize: 48 }}>🎵</span>
                    </div>
                  )}
                </div>

                {/* Track info */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#0a0a0a',
                      fontSize: isFirst ? 42 : 39,
                      marginBottom: 6,
                      lineHeight: 1.2,
                    }}
                  >
                    {track.trackName}
                  </span>
                  <span
                    style={{
                      fontSize: 33,
                      color: isFirst ? colors.from : '#6a6a6a',
                      fontWeight: isFirst ? 500 : 400,
                      lineHeight: 1.2,
                    }}
                  >
                    {track.artistName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SatoriCardWrapper>
  );
}
