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

  const isCircular = data.type === 'artists';
  const isAlbums = data.type === 'albums';
  const items = data.items.slice(0, 5);
  const heroItem = items[0];
  const remainingItems = items.slice(1);

  // Special editorial layout for albums
  if (isAlbums && heroItem) {
    return (
      <ShareCardWrapper theme={theme} variant="vibrant">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p
              style={{
                fontSize: '10px',
                color: colors.from,
                marginBottom: '5px',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                fontWeight: 700,
              }}
            >
              {t(titleKey)}
            </p>
            <p style={{ fontSize: '11px', color: '#999', fontWeight: 400 }}>
              {data.timeRange}
            </p>
          </div>

          {/* Hero Album - #1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '20px',
              position: 'relative',
            }}
          >
            {/* Large rank number behind */}
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '-20px',
                fontSize: '93px',
                fontWeight: 900,
                color: `${colors.from}12`,
                lineHeight: 1,
                zIndex: 0,
              }}
            >
              1
            </div>

            {/* Album artwork with vinyl peek effect */}
            <div
              style={{
                position: 'relative',
                marginBottom: '12px',
                zIndex: 1,
              }}
            >
              {/* Vinyl disc peeking behind */}
              <div
                style={{
                  position: 'absolute',
                  width: '127px',
                  height: '127px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)',
                  top: '7px',
                  left: '33px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Vinyl grooves */}
                <div
                  style={{
                    width: '113px',
                    height: '113px',
                    borderRadius: '50%',
                    border: '1px solid #444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '93px',
                      height: '93px',
                      borderRadius: '50%',
                      border: '1px solid #3a3a3a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '33px',
                        height: '33px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.from}40 0%, ${colors.to}40 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: '#1a1a1a',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Album cover */}
              <div
                style={{
                  width: '133px',
                  height: '133px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  boxShadow: `0 13px 33px -7px rgba(0,0,0,0.4), 0 7px 20px -7px ${colors.from}30`,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {heroItem.image ? (
                  <img
                    src={heroItem.image}
                    alt={heroItem.name}
                    width={133}
                    height={133}
                    style={{ width: '133px', height: '133px', display: 'block' }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    style={{
                      width: '133px',
                      height: '133px',
                      background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '40px' }}>💿</span>
                  </div>
                )}
              </div>
            </div>

            {/* Album info */}
            <div style={{ textAlign: 'center', maxWidth: '233px' }}>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0a0a0a',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                {heroItem.name}
              </p>
              {heroItem.subtitle && (
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.from,
                    fontWeight: 500,
                  }}
                >
                  {heroItem.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Remaining albums 2-5 in a 2x2 grid */}
          {remainingItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '8px',
              }}
            >
              {/* First row: albums 2-3 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: '14px',
                }}
              >
                {remainingItems.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '67px',
                    }}
                  >
                    {/* Album cover */}
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 13px -3px rgba(0,0,0,0.25)',
                        marginBottom: '5px',
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          style={{ width: '60px', height: '60px', display: 'block' }}
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            background: `linear-gradient(135deg, ${colors.from}30 0%, ${colors.to}30 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>💿</span>
                        </div>
                      )}
                    </div>

                    {/* Album name */}
                    <p
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#2a2a2a',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        marginBottom: '2px',
                        maxWidth: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name}
                    </p>
                    {item.subtitle && (
                      <p
                        style={{
                          fontSize: '7px',
                          color: '#888',
                          textAlign: 'center',
                          maxWidth: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtitle.length > 14 ? item.subtitle.slice(0, 14) + '...' : item.subtitle}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Second row: albums 4-5 */}
              {remainingItems.length > 2 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: '14px',
                  }}
                >
                  {remainingItems.slice(2, 4).map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '67px',
                      }}
                    >
                      {/* Album cover */}
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 13px -3px rgba(0,0,0,0.25)',
                          marginBottom: '5px',
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            width={60}
                            height={60}
                            style={{ width: '60px', height: '60px', display: 'block' }}
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div
                            style={{
                              width: '60px',
                              height: '60px',
                              background: `linear-gradient(135deg, ${colors.from}30 0%, ${colors.to}30 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span style={{ fontSize: '18px' }}>💿</span>
                          </div>
                        )}
                      </div>

                      {/* Album name */}
                      <p
                        style={{
                          fontSize: '9px',
                          fontWeight: 600,
                          color: '#2a2a2a',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          marginBottom: '2px',
                          maxWidth: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name}
                      </p>
                      {item.subtitle && (
                        <p
                          style={{
                            fontSize: '7px',
                            color: '#888',
                            textAlign: 'center',
                            maxWidth: '60px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.subtitle.length > 14 ? item.subtitle.slice(0, 14) + '...' : item.subtitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </ShareCardWrapper>
    );
  }

  // Default layout for artists and tracks
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
          {items.map((item, index) => {
            const imgSize = getImageSize(index);

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
