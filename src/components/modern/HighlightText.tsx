'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface HighlightTextProps {
  children: ReactNode;
  color?: 'yellow' | 'green' | 'pink' | 'blue' | 'purple';
  className?: string;
}

const colorMap = {
  yellow: 'highlight-yellow',
  green: 'highlight-green',
  pink: 'highlight-pink',
  blue: 'highlight-blue',
  purple: 'highlight-purple',
};

export function HighlightText({
  children,
  color = 'yellow',
  className,
}: HighlightTextProps) {
  return (
    <span className={cn(colorMap[color], 'px-1', className)}>
      {children}
    </span>
  );
}
