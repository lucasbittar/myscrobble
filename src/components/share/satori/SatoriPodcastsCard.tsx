import { PodcastsShareData } from '../share-types';
import { SatoriCardWrapper } from './SatoriCardWrapper';

interface ColorTheme {
  from: string;
  to: string;
  glow: string;
}

interface SatoriPodcastsCardProps {
  data: PodcastsShareData;
  colors: ColorTheme;
  t: {
    myPodcasts: string;
    episodes: string;
    shows: string;
    savedEpisodes: string;
  };
}

export function SatoriPodcastsCard({ data, colors, t }: SatoriPodcastsCardProps) {
  return (
    <SatoriCardWrapper colors={colors} variant="vibrant">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 33,
            color: colors.from,
            marginBottom: 72,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontWeight: 600,
            display: 'flex',
          }}
        >
          {t.myPodcasts}
        </div>

        {/* Featured Show */}
        {data.featuredShow && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Show artwork */}
            <div
              style={{
                width: 420,
                height: 420,
                marginBottom: 72,
                borderRadius: 60,
                overflow: 'hidden',
                display: 'flex',
                boxShadow: `0 48px 144px -24px ${colors.from}35, 0 24px 72px -24px rgba(0,0,0,0.15)`,
                backgroundColor: `${colors.from}15`,
              }}
            >
              {data.featuredShow.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.featuredShow.image}
                  alt={data.featuredShow.name}
                  width={420}
                  height={420}
                  style={{
                    width: 420,
                    height: 420,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 420,
                    height: 420,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${colors.from}25 0%, ${colors.to}25 100%)`,
                  }}
                >
                  <div style={{ fontSize: 120, display: 'flex' }}>🎙️</div>
                </div>
              )}
            </div>

            {/* Show name */}
            <div
              style={{
                fontSize: 60,
                fontWeight: 800,
                marginBottom: 24,
                color: '#0a0a0a',
                lineHeight: 1.2,
                textAlign: 'center',
                display: 'flex',
                maxWidth: 800,
              }}
            >
              {data.featuredShow.name}
            </div>

            {/* Publisher */}
            <div
              style={{
                fontSize: 39,
                color: colors.from,
                marginBottom: 18,
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {data.featuredShow.publisher}
            </div>

            {/* Episode count */}
            <div
              style={{
                fontSize: 33,
                color: '#7a7a7a',
                marginBottom: 72,
                display: 'flex',
              }}
            >
              {data.featuredShow.episodeCount} {t.episodes}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 120,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                fontSize: 108,
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1,
                display: 'flex',
              }}
            >
              {data.totalShows}
            </div>
            <div
              style={{
                fontSize: 30,
                color: '#8a8a8a',
                marginTop: 18,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {t.shows}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                fontSize: 108,
                fontWeight: 800,
                color: '#0a0a0a',
                lineHeight: 1,
                display: 'flex',
              }}
            >
              {data.totalEpisodes}
            </div>
            <div
              style={{
                fontSize: 30,
                color: '#8a8a8a',
                marginTop: 18,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {t.savedEpisodes}
            </div>
          </div>
        </div>
      </div>
    </SatoriCardWrapper>
  );
}
