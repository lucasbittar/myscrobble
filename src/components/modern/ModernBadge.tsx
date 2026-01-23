'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ModernBadgeProps {
  children: ReactNode;
  color?: 'default' | 'spotify' | 'purple' | 'pink' | 'blue' | 'amber' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'soft';
  className?: string;
}

const colorVariantMap = {
  default: {
    solid: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    soft: 'bg-secondary/50 text-foreground',
  },
  spotify: {
    solid: 'bg-[#1DB954] text-white',
    outline: 'border border-[#1DB954] text-[#1DB954]',
    soft: 'bg-[#1DB954]/10 text-[#1DB954]',
  },
  purple: {
    solid: 'bg-[#8B5CF6] text-white',
    outline: 'border border-[#8B5CF6] text-[#8B5CF6]',
    soft: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  },
  pink: {
    solid: 'bg-[#EC4899] text-white',
    outline: 'border border-[#EC4899] text-[#EC4899]',
    soft: 'bg-[#EC4899]/10 text-[#EC4899]',
  },
  blue: {
    solid: 'bg-[#3B82F6] text-white',
    outline: 'border border-[#3B82F6] text-[#3B82F6]',
    soft: 'bg-[#3B82F6]/10 text-[#3B82F6]',
  },
  amber: {
    solid: 'bg-[#F59E0B] text-white',
    outline: 'border border-[#F59E0B] text-[#F59E0B]',
    soft: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  },
  success: {
    solid: 'bg-green-500 text-white',
    outline: 'border border-green-500 text-green-500',
    soft: 'bg-green-500/10 text-green-500',
  },
  warning: {
    solid: 'bg-yellow-500 text-white',
    outline: 'border border-yellow-500 text-yellow-500',
    soft: 'bg-yellow-500/10 text-yellow-600',
  },
  error: {
    solid: 'bg-red-500 text-white',
    outline: 'border border-red-500 text-red-500',
    soft: 'bg-red-500/10 text-red-500',
  },
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs rounded-md',
  md: 'px-2.5 py-1 text-sm rounded-lg',
  lg: 'px-3 py-1.5 text-base rounded-lg',
};

export function ModernBadge({
  children,
  color = 'default',
  size = 'md',
  variant = 'soft',
  className,
}: ModernBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        colorVariantMap[color][variant],
        sizeMap[size],
        className
      )}
    >
      {children}
    </span>
  );
}
