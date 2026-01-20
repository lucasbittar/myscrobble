'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CRTWrapperProps {
  children: React.ReactNode;
  className?: string;
  scanlines?: boolean;
  flicker?: boolean;
  noise?: boolean;
  curve?: boolean;
}

export function CRTWrapper({
  children,
  className,
  scanlines = true,
  flicker = true,
  noise = false,
  curve = false,
}: CRTWrapperProps) {
  return (
    <div
      className={cn(
        'relative min-h-screen bg-background overflow-hidden',
        scanlines && 'crt-scanlines',
        flicker && 'crt-flicker',
        noise && 'crt-noise',
        curve && 'crt-curve',
        className
      )}
    >
      {/* Vignette effect */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Power on animation */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
        className="relative z-0"
      >
        {children}
      </motion.div>
    </div>
  );
}
