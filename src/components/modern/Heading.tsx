'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { HighlightText } from './HighlightText';

export interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  highlight?: string;
  highlightColor?: 'yellow' | 'green' | 'pink' | 'blue' | 'purple';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

const sizeMap = {
  1: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight',
  2: 'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
  3: 'text-2xl sm:text-3xl md:text-4xl font-bold',
  4: 'text-xl sm:text-2xl font-semibold',
  5: 'text-lg sm:text-xl font-semibold',
  6: 'text-base font-semibold',
};

export function Heading({
  children,
  level = 1,
  highlight,
  highlightColor = 'yellow',
  className,
  as,
}: HeadingProps) {
  const Tag = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  const baseClasses = sizeMap[level];

  const renderContent = () => {
    if (!highlight || typeof children !== 'string') {
      return children;
    }

    const parts = children.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <HighlightText key={index} color={highlightColor}>
          {part}
        </HighlightText>
      ) : (
        part
      )
    );
  };

  return (
    <Tag className={cn(baseClasses, 'text-foreground', className)}>
      {renderContent()}
    </Tag>
  );
}
