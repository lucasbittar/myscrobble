'use client';

import { useTranslations } from 'next-intl';
import { ShareCardWrapper } from './ShareCardWrapper';
import { PodcastsShareData, ShareColorTheme, shareColorThemes } from '../ShareContext';

interface PodcastsShareCardProps {
  data: PodcastsShareData;
  theme?: ShareColorTheme;
}

export function PodcastsShareCard({ data, theme = 'teal' }: PodcastsShareCardProps) {
  const t = useTranslations('contextualShare');
  const colors = shareColorThemes[theme];

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
            marginBottom: '32px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontWeight: 600,
          }}
        >
          {t('cards.myPodcasts')}
        </p>

        {/* Featured Show */}
        {data.featuredShow && (
          <>
            {/* Show artwork - using img tag directly for better html2canvas compatibility */}
            <div
              style={{
                width: '160px',
                height: '160px',
                marginBottom: '28px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: `0 16px 48px -8px ${colors.from}35, 0 8px 24px -8px rgba(0,0,0,0.15)`,
                backgroundColor: `${colors.from}15`,
              }}
            >
              {data.featuredShow.image ? (
                <img
                  src={data.featuredShow.image}
                  alt={data.featuredShow.name}
                  width={160}
                  height={160}
                  style={{
                    display: 'block',
                    width: '160px',
                    height: '160px',
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${colors.from}25 0%, ${colors.to}25 100%)`,
                  }}
                >
                  <span style={{ fontSize: '48px' }}>🎙️</span>
                </div>
              )}
            </div>

            {/* Show name */}
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                marginBottom: '10px',
                color: '#0a0a0a',
                padding: '0 16px',
                lineHeight: 1.2,
              }}
            >
              {data.featuredShow.name}
            </h2>

            {/* Publisher */}
            <p
              style={{
                fontSize: '14px',
                color: colors.from,
                marginBottom: '8px',
                fontWeight: 500,
              }}
            >
              {data.featuredShow.publisher}
            </p>

            {/* Episode count pill */}
            <p
              style={{
                fontSize: '12px',
                color: '#7a7a7a',
                marginBottom: '36px',
              }}
            >
              {data.featuredShow.episodeCount} {t('cards.episodes')}
            </p>
          </>
        )}

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: '40px',
                fontWeight: 800,
                background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
              }}
            >
              {data.totalShows}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#8a8a8a',
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
              }}
            >
              {t('cards.shows')}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: '40px',
                fontWeight: 800,
                color: '#0a0a0a',
                lineHeight: 1,
              }}
            >
              {data.totalEpisodes}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#8a8a8a',
                marginTop: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
              }}
            >
              {t('cards.savedEpisodes')}
            </p>
          </div>
        </div>
      </div>
    </ShareCardWrapper>
  );
}
