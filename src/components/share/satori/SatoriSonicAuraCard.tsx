import { SonicAuraShareData } from '../share-types';
import { SatoriCardWrapper } from './SatoriCardWrapper';

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

interface SatoriSonicAuraCardProps {
  data: SonicAuraShareData;
  backgroundImage?: string;
  t: {
    sonicAura: string;
  };
}

export function SatoriSonicAuraCard({ data, backgroundImage, t }: SatoriSonicAuraCardProps) {
  const colors = moodGradients[data.moodColor];
  const tags = data.moodTags.slice(0, 4);

  return (
    <SatoriCardWrapper colors={colors} variant="vibrant" backgroundImage={backgroundImage}>
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
        <span
          style={{
            fontSize: 33,
            color: colors.from,
            marginBottom: 60,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontWeight: 600,
          }}
        >
          {t.sonicAura}
        </span>

        {/* Aura Orb - only show if no background image (orb is in the background) */}
        {!backgroundImage && (
          <div style={{ position: 'relative', width: 360, height: 360, marginBottom: 72, display: 'flex' }}>
            {/* Outer glow - using radial gradient */}
            <div
              style={{
                position: 'absolute',
                top: -45,
                left: -45,
                width: 450,
                height: 450,
                borderRadius: 225,
                background: `radial-gradient(circle, ${colors.from}40 0%, ${colors.to}20 40%, transparent 70%)`,
              }}
            />

            {/* Main orb gradient */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 18,
                width: 324,
                height: 324,
                borderRadius: 162,
                background: `linear-gradient(135deg, ${colors.from}90 0%, ${colors.to}90 50%, ${colors.from}90 100%)`,
                opacity: 0.8,
              }}
            />

            {/* Inner core - glossy */}
            <div
              style={{
                position: 'absolute',
                top: 45,
                left: 45,
                width: 270,
                height: 270,
                borderRadius: 135,
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${colors.from} 35%, ${colors.to} 100%)`,
                boxShadow: `0 24px 96px ${colors.glow}`,
              }}
            />

            {/* Shine highlight */}
            <div
              style={{
                position: 'absolute',
                top: 75,
                left: 105,
                width: 60,
                height: 38,
                borderRadius: 30,
                background: 'rgba(255, 255, 255, 0.5)',
              }}
            />
          </div>
        )}

        {/* Spacer when using background image orb */}
        {backgroundImage && (
          <div style={{ height: 360, marginBottom: 72 }} />
        )}

        {/* Emoji */}
        {data.emoji && (
          <span style={{ fontSize: 96, marginBottom: 48 }}>{data.emoji}</span>
        )}

        {/* Mood sentence - dark text for light bg, center aligned */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingLeft: 72,
            paddingRight: 72,
            marginBottom: 72,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 39,
              fontWeight: 500,
              color: '#2a2a2a',
              lineHeight: 1.5,
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            {`"${data.moodSentence}"`}
          </div>
        </div>

        {/* Mood tags - using explicit row layout for Satori */}
        {tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            {tags.map((tag, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  padding: '18px 36px',
                  borderRadius: 9999,
                  fontSize: 30,
                  fontWeight: 600,
                  backgroundColor: `${colors.from}15`,
                  color: colors.from,
                  border: `2px solid ${colors.from}30`,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>
    </SatoriCardWrapper>
  );
}
