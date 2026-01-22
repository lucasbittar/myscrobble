'use client';

import { useTranslations } from 'next-intl';
import { ShareCardWrapper } from './ShareCardWrapper';
import { TopChartsShareData, ShareColorTheme, shareColorThemes } from '../ShareContext';

interface TopChartsShareCardProps {
  data: TopChartsShareData;
  theme?: ShareColorTheme;
}

export function TopChartsShareCard({ data, theme = 'purple' }: TopChartsShareCardProps) {
  const t = useTranslations('contextualShare');
  const colors = shareColorThemes[theme];

  const titleKey =
    data.type === 'artists'
      ? 'cards.topArtists'
      : data.type === 'tracks'
        ? 'cards.topTracks'
        : 'cards.topAlbums';

  // Image sizes based on index and type
  const getImageSize = (index: number) => (index === 0 ? 56 : 44);

  return (
    <ShareCardWrapper theme={theme} variant="vibrant">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            {t(titleKey)}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: '#8a8a8a',
            }}
          >
            {data.timeRange}
          </p>
        </div>

        {/* Top 5 list - premium editorial style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.items.slice(0, 5).map((item, index) => {
            const imgSize = getImageSize(index);
            const isCircular = data.type === 'artists';

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '8px 12px',
                  borderRadius: '14px',
                  backgroundColor: index === 0 ? `${colors.from}08` : 'transparent',
                  border: index === 0 ? `1px solid ${colors.from}15` : '1px solid transparent',
                }}
              >
                {/* Rank - bold for #1 */}
                <span
                  style={{
                    width: '26px',
                    textAlign: 'center',
                    fontSize: index === 0 ? '20px' : '15px',
                    fontWeight: 800,
                    color: index === 0 ? colors.from : '#c0c0c0',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>

                {/* Image - using img tag directly for better html2canvas compatibility */}
                {item.image && (
                  <div
                    style={{
                      width: `${imgSize}px`,
                      height: `${imgSize}px`,
                      flexShrink: 0,
                      borderRadius: isCircular ? '50%' : '8px',
                      overflow: 'hidden',
                      boxShadow: index === 0
                        ? `0 6px 20px -4px ${colors.from}35`
                        : '0 2px 8px rgba(0,0,0,0.08)',
                      backgroundColor: `${colors.from}15`,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      width={imgSize}
                      height={imgSize}
                      style={{
                        display: 'block',
                        width: `${imgSize}px`,
                        height: `${imgSize}px`,
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {/* Info */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      color: '#0a0a0a',
                      fontSize: index === 0 ? '15px' : '13px',
                      marginBottom: item.subtitle ? '2px' : 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.name}
                  </p>
                  {item.subtitle && (
                    <p
                      style={{
                        fontSize: '11px',
                        color: index === 0 ? colors.from : '#7a7a7a',
                        fontWeight: index === 0 ? 500 : 400,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ShareCardWrapper>
  );
}
