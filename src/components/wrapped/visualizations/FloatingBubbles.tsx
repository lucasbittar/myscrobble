'use client';

import { motion } from 'framer-motion';

interface FloatingBubblesProps {
  items: string[];
  color?: string;
}

export function FloatingBubbles({ items, color = '#EC4899' }: FloatingBubblesProps) {
  // Calculate bubble sizes based on index (first item is biggest)
  const getBubbleSize = (index: number) => {
    const baseSize = 80;
    const decreaseRate = 12;
    return Math.max(baseSize - index * decreaseRate, 40);
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {items.map((item, index) => {
        const size = getBubbleSize(index);
        // Position bubbles in a scattered but centered pattern
        const angle = (index * 137.5) % 360; // Golden angle for nice distribution
        const radius = 30 + index * 15;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <motion.div
            key={item}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [x, x + 5, x - 5, x],
              y: [y, y - 5, y + 3, y],
            }}
            transition={{
              opacity: { delay: index * 0.1, duration: 0.4 },
              scale: { delay: index * 0.1, duration: 0.5, type: 'spring' },
              x: { duration: 4 + index, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 3 + index, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute flex items-center justify-center rounded-full cursor-default"
            style={{
              width: size,
              height: size,
              backgroundColor: `${color}15`,
              border: `2px solid ${color}40`,
            }}
          >
            <motion.span
              className="text-xs md:text-sm font-medium text-center px-2 capitalize"
              style={{ color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {item}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}
