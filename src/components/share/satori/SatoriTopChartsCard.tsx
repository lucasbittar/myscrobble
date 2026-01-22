import { TopChartsShareData } from '../share-types';
import { SatoriCardWrapper } from './SatoriCardWrapper';

interface ColorTheme {
  from: string;
  to: string;
  glow: string;
}

interface SatoriTopChartsCardProps {
  data: TopChartsShareData;
  colors: ColorTheme;
  t: {
    title: string;
  };
}

export function SatoriTopChartsCard({ data, colors, t }: SatoriTopChartsCardProps) {
  const isCircular = data.type === 'artists';

  return (
    <SatoriCardWrapper colors={colors} variant="vibrant">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 72 }}>
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
            {t.title}
          </span>
          <span
            style={{
              fontSize: 39,
              color: '#8a8a8a',
            }}
          >
            {data.timeRange}
          </span>
        </div>

        {/* Top 5 list - premium editorial style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {data.items.slice(0, 5).map((item, index) => {
            const isFirst = index === 0;
            const imgSize = isFirst ? 168 : 132;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 42,
                  padding: '24px 36px',
                  borderRadius: 42,
                  backgroundColor: isFirst ? `${colors.from}08` : 'transparent',
                  border: isFirst ? `3px solid ${colors.from}15` : '3px solid transparent',
                }}
              >
                {/* Rank - bold for #1 */}
                <span
                  style={{
                    width: 78,
                    textAlign: 'center',
                    fontSize: isFirst ? 60 : 45,
                    fontWeight: 800,
                    color: isFirst ? colors.from : '#c0c0c0',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                {/* Image */}
                {item.image && (
                  <div
                    style={{
                      width: imgSize,
                      height: imgSize,
                      flexShrink: 0,
                      borderRadius: isCircular ? '50%' : 24,
                      overflow: 'hidden',
                      display: 'flex',
                      boxShadow: isFirst
                        ? `0 18px 60px -12px ${colors.from}35`
                        : '0 6px 24px rgba(0,0,0,0.08)',
                      backgroundColor: `${colors.from}15`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      width={imgSize}
                      height={imgSize}
                      style={{
                        width: imgSize,
                        height: imgSize,
                      }}
                    />
                  </div>
                )}

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#0a0a0a',
                      fontSize: isFirst ? 45 : 39,
                      marginBottom: item.subtitle ? 6 : 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </span>
                  {item.subtitle && (
                    <span
                      style={{
                        fontSize: 33,
                        color: isFirst ? colors.from : '#7a7a7a',
                        fontWeight: isFirst ? 500 : 400,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SatoriCardWrapper>
  );
}
