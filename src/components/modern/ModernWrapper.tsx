'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModernWrapperProps {
  children: ReactNode;
  className?: string;
  withBlobs?: boolean;
}

export function ModernWrapper({ children, className, withBlobs = false }: ModernWrapperProps) {
  return (
    <div className={cn('min-h-screen bg-background relative overflow-hidden', className)}>
      {withBlobs && (
        <>
          {/* Top right blob */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full gradient-purple-indigo opacity-20 blur-3xl animate-blob-float pointer-events-none" />
          {/* Bottom left blob */}
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full gradient-pink-rose opacity-20 blur-3xl animate-blob-float-slow pointer-events-none" />
          {/* Center blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full gradient-teal-emerald opacity-10 blur-3xl animate-pulse-soft pointer-events-none" />
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
