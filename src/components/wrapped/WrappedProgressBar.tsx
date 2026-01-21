'use client';

import { motion } from 'framer-motion';

interface WrappedProgressBarProps {
  current: number;
  total: number;
  onDotClick?: (index: number) => void;
}

export function WrappedProgressBar({ current, total, onDotClick }: WrappedProgressBarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 px-4 pt-4 pb-2 safe-area-top">
      <div className="flex gap-1.5 max-w-md mx-auto">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            onClick={() => onDotClick?.(index)}
            className="cursor-pointer relative flex-1 h-1 rounded-full overflow-hidden bg-white/20 transition-transform hover:scale-y-150"
          >
            {/* Completed segments */}
            {index < current && (
              <div className="absolute inset-0 bg-white rounded-full" />
            )}
            {/* Current segment with animation */}
            {index === current && (
              <motion.div
                className="absolute inset-0 bg-white rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
