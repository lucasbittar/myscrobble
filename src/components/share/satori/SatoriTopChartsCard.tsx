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
  backgroundImage?: string;
  t: {
    title: string;
  };
}

export function SatoriTopChartsCard({ data, colors, backgroundImage, t }: SatoriTopChartsCardProps) {
  const isCircular = data.type === 'artists';
  const isAlbums = data.type === 'albums';
  const items = data.items.slice(0, 5);
  const heroItem = items[0];
  const remainingItems = items.slice(1);

  // For albums, use a special editorial layout
  if (isAlbums && heroItem) {
    return (
      <SatoriCardWrapper colors={colors} variant="vibrant" backgroundImage={backgroundImage}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 48,
            }}
          >
            <div
              style={{
                fontSize: 30,
                color: colors.from,
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                fontWeight: 700,
                marginBottom: 16,
                display: 'flex',
              }}
            >
              {t.title}
            </div>
            <div
              style={{
                fontSize: 33,
                color: '#999',
                fontWeight: 400,
                display: 'flex',
              }}
            >
              {data.timeRange}
            </div>
          </div>

          {/* Hero Album - #1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 60,
              position: 'relative',
            }}
          >
            {/* Large rank number behind */}
            <div
              style={{
                position: 'absolute',
                top: -40,
                left: -60,
                fontSize: 280,
                fontWeight: 900,
                color: `${colors.from}12`,
                lineHeight: 1,
                display: 'flex',
              }}
            >
              1
            </div>

            {/* Album artwork with vinyl peek effect */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                marginBottom: 36,
              }}
            >
              {/* Vinyl disc peeking behind */}
              <div
                style={{
                  position: 'absolute',
                  width: 380,
                  height: 380,
                  borderRadius: 190,
                  background: `linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)`,
                  top: 20,
                  left: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Vinyl grooves */}
                <div
                  style={{
                    width: 340,
                    height: 340,
                    borderRadius: 170,
                    border: '1px solid #444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 280,
                      height: 280,
                      borderRadius: 140,
                      border: '1px solid #3a3a3a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        background: `linear-gradient(135deg, ${colors.from}40 0%, ${colors.to}40 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
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
                  width: 400,
                  height: 400,
                  borderRadius: 12,
                  overflow: 'hidden',
                  display: 'flex',
                  boxShadow: `0 40px 100px -20px rgba(0,0,0,0.4), 0 20px 60px -20px ${colors.from}30`,
                  position: 'relative',
                }}
              >
                {heroItem.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroItem.image}
                    alt={heroItem.name}
                    width={400}
                    height={400}
                    style={{ width: 400, height: 400 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 400,
                      height: 400,
                      background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ fontSize: 120, display: 'flex' }}>💿</div>
                  </div>
                )}
              </div>
            </div>

            {/* Album info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: 700,
              }}
            >
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 800,
                  color: '#0a0a0a',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  marginBottom: 12,
                  display: 'flex',
                }}
              >
                {heroItem.name}
              </div>
              {heroItem.subtitle && (
                <div
                  style={{
                    fontSize: 36,
                    color: colors.from,
                    fontWeight: 500,
                    display: 'flex',
                  }}
                >
                  {heroItem.subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Remaining albums 2-5 in a 2x2 grid */}
          {remainingItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
                marginTop: 24,
              }}
            >
              {/* First row: albums 2-3 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 40,
                }}
              >
                {remainingItems.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: 200,
                    }}
                  >
                    {/* Album cover */}
                    <div
                      style={{
                        width: 180,
                        height: 180,
                        borderRadius: 12,
                        overflow: 'hidden',
                        display: 'flex',
                        boxShadow: '0 12px 40px -10px rgba(0,0,0,0.25)',
                        marginBottom: 16,
                      }}
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          width={180}
                          height={180}
                          style={{ width: 180, height: 180 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 180,
                            height: 180,
                            background: `linear-gradient(135deg, ${colors.from}30 0%, ${colors.to}30 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ fontSize: 54, display: 'flex' }}>💿</div>
                        </div>
                      )}
                    </div>

                    {/* Album name */}
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 600,
                        color: '#2a2a2a',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        marginBottom: 6,
                        display: 'flex',
                        maxWidth: 180,
                      }}
                    >
                      {item.name.length > 16 ? item.name.slice(0, 16) + '...' : item.name}
                    </div>
                    {item.subtitle && (
                      <div
                        style={{
                          fontSize: 22,
                          color: '#888',
                          textAlign: 'center',
                          display: 'flex',
                          maxWidth: 180,
                        }}
                      >
                        {item.subtitle.length > 18 ? item.subtitle.slice(0, 18) + '...' : item.subtitle}
                      </div>
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
                    gap: 40,
                  }}
                >
                  {remainingItems.slice(2, 4).map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: 200,
                      }}
                    >
                      {/* Album cover */}
                      <div
                        style={{
                          width: 180,
                          height: 180,
                          borderRadius: 12,
                          overflow: 'hidden',
                          display: 'flex',
                          boxShadow: '0 12px 40px -10px rgba(0,0,0,0.25)',
                          marginBottom: 16,
                        }}
                      >
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            width={180}
                            height={180}
                            style={{ width: 180, height: 180 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 180,
                              height: 180,
                              background: `linear-gradient(135deg, ${colors.from}30 0%, ${colors.to}30 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <div style={{ fontSize: 54, display: 'flex' }}>💿</div>
                          </div>
                        )}
                      </div>

                      {/* Album name */}
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 600,
                          color: '#2a2a2a',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          marginBottom: 6,
                          display: 'flex',
                          maxWidth: 180,
                        }}
                      >
                        {item.name.length > 16 ? item.name.slice(0, 16) + '...' : item.name}
                      </div>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: 22,
                            color: '#888',
                            textAlign: 'center',
                            display: 'flex',
                            maxWidth: 180,
                          }}
                        >
                          {item.subtitle.length > 18 ? item.subtitle.slice(0, 18) + '...' : item.subtitle}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SatoriCardWrapper>
    );
  }

  // Default layout for artists and tracks
  return (
    <SatoriCardWrapper colors={colors} variant="vibrant" backgroundImage={backgroundImage}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 72 }}>
          <div
            style={{
              fontSize: 33,
              color: colors.from,
              marginBottom: 24,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {t.title}
          </div>
          <div
            style={{
              fontSize: 39,
              color: '#8a8a8a',
              display: 'flex',
            }}
          >
            {data.timeRange}
          </div>
        </div>

        {/* Top 5 list - premium editorial style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {items.map((item, index) => {
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
                <div
                  style={{
                    width: 78,
                    textAlign: 'center',
                    fontSize: isFirst ? 60 : 45,
                    fontWeight: 800,
                    color: isFirst ? colors.from : '#c0c0c0',
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {index + 1}
                </div>

                {/* Image */}
                {item.image && (
                  <div
                    style={{
                      width: imgSize,
                      height: imgSize,
                      flexShrink: 0,
                      borderRadius: isCircular ? imgSize / 2 : 24,
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
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#0a0a0a',
                      fontSize: isFirst ? 45 : 39,
                      marginBottom: item.subtitle ? 6 : 0,
                      lineHeight: 1.2,
                      display: 'flex',
                    }}
                  >
                    {item.name}
                  </div>
                  {item.subtitle && (
                    <div
                      style={{
                        fontSize: 33,
                        color: isFirst ? colors.from : '#7a7a7a',
                        fontWeight: isFirst ? 500 : 400,
                        lineHeight: 1.2,
                        display: 'flex',
                      }}
                    >
                      {item.subtitle}
                    </div>
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
