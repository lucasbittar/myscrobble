'use client';

type AuraMood = 'energetic' | 'chill' | 'melancholic' | 'nostalgic' | 'experimental';

interface AuraColors {
  from: string;
  to: string;
  glow: string;
  accent: string;
}

const auraConfigs: Record<AuraMood, AuraColors> = {
  energetic: {
    from: '#EC4899',
    to: '#F59E0B',
    glow: 'rgba(236, 72, 153, 0.5)',
    accent: '#FB7185',
  },
  chill: {
    from: '#3B82F6',
    to: '#14B8A6',
    glow: 'rgba(59, 130, 246, 0.5)',
    accent: '#60A5FA',
  },
  melancholic: {
    from: '#8B5CF6',
    to: '#6366F1',
    glow: 'rgba(139, 92, 246, 0.5)',
    accent: '#A78BFA',
  },
  nostalgic: {
    from: '#F59E0B',
    to: '#EF4444',
    glow: 'rgba(245, 158, 11, 0.5)',
    accent: '#FBBF24',
  },
  experimental: {
    from: '#8B5CF6',
    to: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.5)',
    accent: '#C084FC',
  },
};

interface AuraOrbBackgroundProps {
  mood: AuraMood;
}

export function AuraOrbBackground({ mood }: AuraOrbBackgroundProps) {
  const colors = auraConfigs[mood];

  return (
    <div
      className="relative w-[1080px] h-[1920px] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FAFBFC 0%, #F5F5F7 40%, #F0F0F2 100%)',
      }}
    >
      {/* Atmospheric gradient wash at top */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 150% 60% at 50% -10%, ${colors.from}12 0%, transparent 70%)`,
        }}
      />

      {/* Subtle ambient blobs - static */}
      <div
        className="absolute"
        style={{
          width: 500,
          height: 500,
          top: -150,
          right: -100,
          background: `radial-gradient(circle, ${colors.from}25 0%, transparent 70%)`,
          filter: 'blur(100px)',
        }}
      />

      <div
        className="absolute"
        style={{
          width: 400,
          height: 400,
          bottom: '20%',
          left: -120,
          background: `radial-gradient(circle, ${colors.to}20 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />

      <div
        className="absolute"
        style={{
          width: 350,
          height: 350,
          bottom: -50,
          right: '20%',
          background: `radial-gradient(circle, ${colors.accent}18 0%, transparent 70%)`,
          filter: 'blur(70px)',
        }}
      />

      {/* ========== MAIN ORB SYSTEM - STATIC ========== */}
      {/* Positioned to match where the dynamic orb renders in SatoriSonicAuraCard */}
      <div
        className="absolute"
        style={{
          top: 540,
          left: 540,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outermost glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${colors.glow}30 0%, ${colors.from}10 40%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: 0.7,
          }}
        />

        {/* Outer glow ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${colors.from}50 0%, ${colors.to}30 50%, transparent 100%)`,
            filter: 'blur(50px)',
            opacity: 0.6,
          }}
        />

        {/* Mid glow layer */}
        <div
          className="absolute rounded-full"
          style={{
            width: 380,
            height: 380,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(from 45deg at 50% 50%, ${colors.from}80, ${colors.to}60, ${colors.accent}70, ${colors.from}80)`,
            filter: 'blur(40px)',
            opacity: 0.6,
          }}
        />

        {/* Inner glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle at 35% 35%, white 0%, ${colors.from}90 30%, ${colors.to}80 60%, ${colors.accent}50 100%)`,
            filter: 'blur(25px)',
            opacity: 0.8,
          }}
        />

        {/* Core orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 20%, ${colors.from} 50%, ${colors.to} 100%)`,
            boxShadow: `0 0 80px ${colors.glow}, 0 0 120px ${colors.from}60, 0 0 160px ${colors.to}40`,
          }}
        />

        {/* Inner highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: 80,
            height: 80,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) translate(-20px, -20px)',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Premium noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.025,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Soft vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.04) 100%)',
        }}
      />
    </div>
  );
}
