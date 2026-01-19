'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TerminalCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  glow?: boolean;
  animate?: boolean;
}

export function TerminalCard({
  children,
  title,
  className,
  glow = false,
  animate = true,
}: TerminalCardProps) {
  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-[rgba(0,255,65,0.3)] bg-[#0d0d0d]',
        glow && 'box-glow',
        className
      )}
    >
      {/* Terminal header */}
      {title && (
        <div className="flex items-center gap-2 border-b border-[rgba(0,255,65,0.2)] px-4 py-2">
          {/* Terminal dots */}
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 font-terminal text-sm text-[#888888]">
            {title}
          </span>
        </div>
      )}

      {/* Card content */}
      <div className="p-4">{children}</div>

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.3)]" />
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
