'use client';

import { useTranslations } from 'next-intl';
import { ShareCardWrapper } from './ShareCardWrapper';
import { SonicAuraShareData, ShareColorTheme } from '../ShareContext';

interface SonicAuraShareCardProps {
  data: SonicAuraShareData;
  theme?: ShareColorTheme;
}

// Mood color gradients matching MoodAnalysis component
const moodGradients: Record<
  SonicAuraShareData['moodColor'],
  { from: string; to: string; glow: string }
> = {
  energetic: {
    from: '#EC4899',
    to: '#F59E0B',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  chill: {
    from: '#3B82F6',
    to: '#14B8A6',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  melancholic: {
    from: '#8B5CF6',
    to: '#6366F1',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  nostalgic: {
    from: '#F59E0B',
    to: '#EF4444',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  experimental: {
    from: '#8B5CF6',
    to: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
};

export function SonicAuraShareCard({ data, theme = 'dynamic' }: SonicAuraShareCardProps) {
  const t = useTranslations('contextualShare');
  const colors = moodGradients[data.moodColor];

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
          {t('cards.sonicAura')}
        </p>

        {/* Aura Orb - refined for light background */}
        <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '16px' }}>
          {/* Outer glow - softer on light bg */}
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              borderRadius: '50%',
              filter: 'blur(30px)',
              opacity: 0.35,
              background: `radial-gradient(circle, ${colors.from} 0%, ${colors.to} 100%)`,
            }}
          />

          {/* Main orb gradient */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              right: '4px',
              bottom: '4px',
              borderRadius: '50%',
              filter: 'blur(8px)',
              background: `conic-gradient(from 180deg, ${colors.from}, ${colors.to}, ${colors.from})`,
              opacity: 0.7,
            }}
          />

          {/* Inner core - glossy */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
              bottom: '16px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${colors.from}90 35%, ${colors.to}80 100%)`,
              boxShadow: `0 8px 32px ${colors.glow}, inset 0 -8px 16px ${colors.to}40`,
            }}
          />

          {/* Shine highlight */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '36px',
              width: '32px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.6)',
              filter: 'blur(6px)',
            }}
          />
        </div>

        {/* Emoji */}
        {data.emoji && (
          <span style={{ fontSize: '44px', marginBottom: '8px' }}>{data.emoji}</span>
        )}

        {/* Mood sentence - dark text for light bg */}
        <p
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#2a2a2a',
            lineHeight: 1.5,
            padding: '0 24px',
            marginBottom: '24px',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{data.moodSentence}&rdquo;
        </p>

        {/* Mood tags - refined pills */}
        {data.moodTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {data.moodTags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '5px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  height: '28px',
                  fontWeight: 600,
                  backgroundColor: `${colors.from}12`,
                  color: colors.from,
                  border: `1px solid ${colors.from}25`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </ShareCardWrapper>
  );
}
