'use client';

import { cn } from '@/lib/utils';

export interface BlobProps {
  color?: 'purple' | 'pink' | 'teal' | 'blue' | 'amber' | 'spotify';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  animate?: boolean;
  className?: string;
}

const colorMap = {
  purple: 'gradient-purple-indigo',
  pink: 'gradient-pink-rose',
  teal: 'gradient-teal-emerald',
  blue: 'gradient-blue-cyan',
  amber: 'gradient-amber-orange',
  spotify: 'gradient-spotify',
};

const positionMap = {
  'top-right': '-top-40 -right-40',
  'top-left': '-top-40 -left-40',
  'bottom-right': '-bottom-40 -right-40',
  'bottom-left': '-bottom-40 -left-40',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const sizeMap = {
  sm: 'w-[200px] h-[200px]',
  md: 'w-[400px] h-[400px]',
  lg: 'w-[500px] h-[500px]',
  xl: 'w-[700px] h-[700px]',
};

const blurMap = {
  sm: 'blur-xl',
  md: 'blur-2xl',
  lg: 'blur-3xl',
  xl: 'blur-[100px]',
};

export function BlobBackground({
  color = 'purple',
  position = 'top-right',
  size = 'lg',
  blur = 'lg',
  opacity = 20,
  animate = true,
  className,
}: BlobProps) {
  return (
    <div
      className={cn(
        'absolute rounded-full pointer-events-none',
        colorMap[color],
        positionMap[position],
        sizeMap[size],
        blurMap[blur],
        animate && (position === 'center' ? 'animate-pulse-soft' : 'animate-blob-float'),
        className
      )}
      style={{ opacity: opacity / 100 }}
    />
  );
}
