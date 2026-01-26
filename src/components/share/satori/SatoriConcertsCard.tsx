import { ConcertsShareData } from '../share-types';
import { SatoriCardWrapper } from './SatoriCardWrapper';

interface ColorTheme {
  from: string;
  to: string;
  glow: string;
}

interface SatoriConcertsCardProps {
  data: ConcertsShareData;
  colors: ColorTheme;
  backgroundImage?: string;
  locale: string;
  t: {
    nextShow: string;
    daysText: string;
    moreShows: string;
    noConcerts: string;
  };
}

export function SatoriConcertsCard({ data, colors, backgroundImage, locale, t }: SatoriConcertsCardProps) {
  if (!data.nextConcert) {
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
          <span style={{ fontSize: 54, color: '#6a6a6a' }}>{t.noConcerts}</span>
        </div>
      </SatoriCardWrapper>
    );
  }

  const dateLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';
  const concertDate = new Date(data.nextConcert.date);
  const dateFormatted = concertDate.toLocaleDateString(dateLocale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SatoriCardWrapper colors={colors} variant="vibrant" backgroundImage={backgroundImage}>
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
            marginBottom: 72,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontWeight: 600,
          }}
        >
          {t.nextShow}
        </span>

        {/* Days until badge - premium pill */}
        <div
          style={{
            padding: '30px 60px',
            borderRadius: 9999,
            fontSize: 39,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 84,
            display: 'flex',
            background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
            boxShadow: `0 24px 72px -12px ${colors.from}40`,
            letterSpacing: '0.02em',
          }}
        >
          {t.daysText}
        </div>

        {/* Artist image */}
        {data.nextConcert.artistImage && (
          <div
            style={{
              width: 420,
              height: 420,
              marginBottom: 84,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              boxShadow: `0 48px 144px -24px ${colors.from}35, 0 24px 72px -24px rgba(0,0,0,0.15)`,
              border: `9px solid ${colors.from}25`,
              backgroundColor: `${colors.from}15`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.nextConcert.artistImage}
              alt={data.nextConcert.artistName}
              width={420}
              height={420}
              style={{
                width: 420,
                height: 420,
              }}
            />
          </div>
        )}

        {/* Artist name */}
        <span
          style={{
            fontSize: 84,
            fontWeight: 800,
            marginBottom: 60,
            color: '#0a0a0a',
            lineHeight: 1.1,
          }}
        >
          {data.nextConcert.artistName}
        </span>

        {/* Venue & location - refined typography */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <span
            style={{
              color: '#2a2a2a',
              fontWeight: 600,
              fontSize: 45,
              textAlign: 'center',
            }}
          >
            {data.nextConcert.venue}
          </span>
          <span
            style={{
              color: colors.from,
              fontSize: 42,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {data.nextConcert.city}
          </span>
          <span
            style={{
              color: '#8a8a8a',
              fontSize: 39,
              marginTop: 24,
              textTransform: 'capitalize',
              textAlign: 'center',
            }}
          >
            {dateFormatted}
          </span>
        </div>

        {/* Upcoming count */}
        {data.upcomingCount > 1 && (
          <div
            style={{
              marginTop: 96,
              padding: '30px 60px',
              borderRadius: 9999,
              display: 'flex',
              backgroundColor: `${colors.from}10`,
              border: `3px solid ${colors.from}20`,
              color: colors.from,
              fontSize: 39,
              fontWeight: 500,
            }}
          >
            +{data.upcomingCount - 1} {t.moreShows}
          </div>
        )}
      </div>
    </SatoriCardWrapper>
  );
}
