'use client';

import { motion } from 'framer-motion';

interface RadialChartProps {
  data: Array<{ hour: number; count: number }>;
  color?: string;
  secondaryColor?: string;
}

export function RadialChart({
  data,
  color = '#14B8A6',
  secondaryColor = '#10B981'
}: RadialChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const radius = 100;
  const innerRadius = 40;
  const center = 120;

  // Create 24 segments for hours
  const segmentAngle = 360 / 24;

  return (
    <div className="relative w-60 h-60 mx-auto">
      <svg viewBox="0 0 240 240" className="w-full h-full">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-white/10"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-white/10"
        />

        {/* Hour markers */}
        {[0, 6, 12, 18].map((hour) => {
          const angle = (hour * segmentAngle - 90) * (Math.PI / 180);
          const x1 = center + Math.cos(angle) * (radius - 10);
          const y1 = center + Math.sin(angle) * (radius - 10);
          const x2 = center + Math.cos(angle) * (radius + 15);
          const y2 = center + Math.sin(angle) * (radius + 15);

          return (
            <g key={hour}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1"
                className="text-white/20"
              />
              <text
                x={center + Math.cos(angle) * (radius + 25)}
                y={center + Math.sin(angle) * (radius + 25)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-white/60"
              >
                {hour === 0 ? '12AM' : hour === 12 ? '12PM' : `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`}
              </text>
            </g>
          );
        })}

        {/* Data segments */}
        {data.map((item, index) => {
          const normalizedValue = item.count / maxCount;
          const barRadius = innerRadius + (radius - innerRadius) * normalizedValue;

          const startAngle = (item.hour * segmentAngle - 90 - segmentAngle / 2) * (Math.PI / 180);
          const endAngle = (item.hour * segmentAngle - 90 + segmentAngle / 2) * (Math.PI / 180);

          const x1Inner = center + Math.cos(startAngle) * innerRadius;
          const y1Inner = center + Math.sin(startAngle) * innerRadius;
          const x2Inner = center + Math.cos(endAngle) * innerRadius;
          const y2Inner = center + Math.sin(endAngle) * innerRadius;
          const x1Outer = center + Math.cos(startAngle) * barRadius;
          const y1Outer = center + Math.sin(startAngle) * barRadius;
          const x2Outer = center + Math.cos(endAngle) * barRadius;
          const y2Outer = center + Math.sin(endAngle) * barRadius;

          const pathData = `
            M ${x1Inner} ${y1Inner}
            L ${x1Outer} ${y1Outer}
            A ${barRadius} ${barRadius} 0 0 1 ${x2Outer} ${y2Outer}
            L ${x2Inner} ${y2Inner}
            A ${innerRadius} ${innerRadius} 0 0 0 ${x1Inner} ${y1Inner}
          `;

          return (
            <motion.path
              key={item.hour}
              d={pathData}
              fill={`url(#gradient-${item.hour})`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.5 }}
            />
          );
        })}

        {/* Gradient definitions */}
        <defs>
          {data.map((item) => (
            <radialGradient
              key={item.hour}
              id={`gradient-${item.hour}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={secondaryColor} />
            </radialGradient>
          ))}
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">24h</div>
        </div>
      </div>
    </div>
  );
}
