'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ShareCardWrapper } from './ShareCardWrapper';
import { ConcertsShareData, ShareColorTheme, shareColorThemes } from '../ShareContext';

interface ConcertsShareCardProps {
  data: ConcertsShareData;
  theme?: ShareColorTheme;
}

export function ConcertsShareCard({ data, theme = 'pink' }: ConcertsShareCardProps) {
  const t = useTranslations('contextualShare');
  const locale = useLocale();
  const colors = shareColorThemes[theme];

  const dateLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';

  if (!data.nextConcert) {
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
          <p style={{ fontSize: '18px', color: '#6a6a6a' }}>{t('cards.noConcerts')}</p>
        </div>
      </ShareCardWrapper>
    );
  }

  const concertDate = new Date(data.nextConcert.date);
  const dateFormatted = concertDate.toLocaleDateString(dateLocale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ShareCardWrapper theme={theme} variant="vibrant">
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
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontWeight: 600,
          }}
        >
          {t('cards.nextShow')}
        </p>

        {/* Days until badge - premium pill */}
        <div
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '28px',
            background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
            boxShadow: `0 8px 24px -4px ${colors.from}40`,
            letterSpacing: '0.02em',
          }}
        >
          {data.nextConcert.daysUntil === 0
            ? t('cards.today')
            : data.nextConcert.daysUntil === 1
              ? t('cards.tomorrow')
              : t('cards.inDays', { days: data.nextConcert.daysUntil })}
        </div>

        {/* Artist image - using img tag directly for better html2canvas compatibility */}
        {data.nextConcert.artistImage && (
          <div
            style={{
              width: '140px',
              height: '140px',
              marginBottom: '28px',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: `0 16px 48px -8px ${colors.from}35, 0 8px 24px -8px rgba(0,0,0,0.15)`,
              border: `3px solid ${colors.from}25`,
              backgroundColor: `${colors.from}15`,
            }}
          >
            <img
              src={data.nextConcert.artistImage}
              alt={data.nextConcert.artistName}
              width={140}
              height={140}
              style={{
                display: 'block',
                width: '140px',
                height: '140px',
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Artist name */}
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '20px',
            color: '#0a0a0a',
            lineHeight: 1.1,
          }}
        >
          {data.nextConcert.artistName}
        </h2>

        {/* Venue & location - refined typography */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p
            style={{
              color: '#2a2a2a',
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            {data.nextConcert.venue}
          </p>
          <p
            style={{
              color: colors.from,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {data.nextConcert.city}
          </p>
          <p
            style={{
              color: '#8a8a8a',
              fontSize: '13px',
              marginTop: '8px',
              textTransform: 'capitalize',
            }}
          >
            {dateFormatted}
          </p>
        </div>

        {/* Upcoming count */}
        {data.upcomingCount > 1 && (
          <div
            style={{
              marginTop: '32px',
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: `${colors.from}10`,
              border: `1px solid ${colors.from}20`,
              color: colors.from,
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            +{data.upcomingCount - 1} {t('cards.moreShows')}
          </div>
        )}
      </div>
    </ShareCardWrapper>
  );
}
