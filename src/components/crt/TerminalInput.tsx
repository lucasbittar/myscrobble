'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface TerminalInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block font-terminal text-sm text-[#888888]">
            <span className="text-[#00ff41]">&gt;</span> {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff41]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-md border border-[rgba(0,255,65,0.3)] bg-[#0a0a0a] px-4 py-2.5 font-terminal text-[#e0e0e0] placeholder:text-[#555555]',
              'transition-all duration-200',
              'hover:border-[rgba(0,255,65,0.5)]',
              'focus:border-[#00ff41] focus:outline-none focus:ring-2 focus:ring-[rgba(0,255,65,0.2)]',
              icon && 'pl-10',
              error && 'border-[#ff4444] focus:border-[#ff4444] focus:ring-[rgba(255,68,68,0.2)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="font-terminal text-sm text-[#ff4444]">
            <span className="text-[#ff4444]">!</span> {error}
          </p>
        )}
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
