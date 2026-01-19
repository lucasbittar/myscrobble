'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type GlowColor = 'phosphor' | 'cyan' | 'magenta' | 'amber';
type GlowSize = 'sm' | 'md' | 'lg';

interface GlowTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  color?: GlowColor;
  size?: GlowSize;
  animate?: boolean;
  className?: string;
}

const colorClasses: Record<GlowColor, string> = {
  phosphor: 'text-[#00ff41]',
  cyan: 'text-[#00f5ff]',
  magenta: 'text-[#ff00ff]',
  amber: 'text-[#ffb000]',
};

const sizeClasses: Record<GlowSize, string> = {
  sm: 'text-glow-sm',
  md: 'text-glow',
  lg: 'text-glow-lg',
};

export function GlowText({
  children,
  as: Component = 'span',
  color = 'phosphor',
  size = 'md',
  animate = false,
  className,
}: GlowTextProps) {
  const classes = cn(
    colorClasses[color],
    sizeClasses[size],
    'font-terminal',
    className
  );

  if (animate) {
    return (
      <motion.span
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5 }}
        className={classes}
      >
        {children}
      </motion.span>
    );
  }

  return <Component className={classes}>{children}</Component>;
}
