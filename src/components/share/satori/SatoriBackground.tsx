interface ColorTheme {
  from: string;
  to: string;
  glow: string;
}

interface SatoriBackgroundProps {
  colors: ColorTheme;
  variant?: 'default' | 'vibrant' | 'subtle';
}

export function SatoriBackground({ colors, variant = 'default' }: SatoriBackgroundProps) {
  const intensity = variant === 'vibrant' ? 1 : variant === 'subtle' ? 0.5 : 0.7;
  const opacityTop = Math.round(0.12 * intensity * 255).toString(16).padStart(2, '0');
  const opacityBottom = Math.round(0.1 * intensity * 255).toString(16).padStart(2, '0');
  const opacityCenter = Math.round(0.06 * intensity * 255).toString(16).padStart(2, '0');

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Base: clean off-white */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          backgroundColor: '#FAFBFC',
        }}
      />

      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          background: `linear-gradient(160deg, ${colors.from}08 0%, transparent 40%, ${colors.to}05 100%)`,
        }}
      />

      {/* Top-right accent - using radial gradient instead of blur */}
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          top: -200,
          right: -200,
          borderRadius: 500,
          background: `radial-gradient(circle, ${colors.from}${opacityTop} 0%, transparent 70%)`,
        }}
      />

      {/* Bottom-left accent */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          bottom: -200,
          left: -200,
          borderRadius: 400,
          background: `radial-gradient(circle, ${colors.to}${opacityBottom} 0%, transparent 70%)`,
        }}
      />

      {/* Center subtle accent */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          top: 660,
          left: 240,
          borderRadius: 300,
          background: `radial-gradient(circle, ${colors.from}${opacityCenter} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
