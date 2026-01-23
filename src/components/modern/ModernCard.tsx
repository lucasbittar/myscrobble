'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ModernCardProps {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  border?: boolean;
  className?: string;
  onClick?: () => void;
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowMap = {
  none: '',
  sm: 'shadow-soft',
  md: 'shadow-soft-md',
  lg: 'shadow-soft-lg',
  xl: 'shadow-soft-xl',
};

const roundedMap = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-[24px]',
  '3xl': 'rounded-[32px]',
};

export function ModernCard({
  children,
  hover = false,
  padding = 'md',
  shadow = 'md',
  rounded = 'xl',
  border = true,
  className,
  onClick,
}: ModernCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card',
        paddingMap[padding],
        shadowMap[shadow],
        roundedMap[rounded],
        border && 'border border-border',
        hover && 'transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
