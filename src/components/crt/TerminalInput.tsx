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
          <label className="block font-terminal text-sm text-muted-foreground">
            <span className="text-primary">&gt;</span> {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-md border border-primary/30 bg-background px-4 py-2.5 font-terminal text-foreground placeholder:text-muted-foreground',
              'transition-all duration-200',
              'hover:border-primary/50',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              icon && 'pl-10',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="font-terminal text-sm text-destructive">
            <span className="text-destructive">!</span> {error}
          </p>
        )}
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
