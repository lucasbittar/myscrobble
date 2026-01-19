'use client';

import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface TerminalButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#00ff41] text-[#0a0a0a] hover:bg-[#00cc33] border-[#00ff41] hover:shadow-[0_0_20px_rgba(0,255,65,0.5)]',
  secondary:
    'bg-transparent text-[#00f5ff] border-[#00f5ff] hover:bg-[rgba(0,245,255,0.1)] hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]',
  ghost:
    'bg-transparent text-[#e0e0e0] border-transparent hover:border-[rgba(0,255,65,0.3)] hover:text-[#00ff41]',
  danger:
    'bg-transparent text-[#ff4444] border-[#ff4444] hover:bg-[rgba(255,68,68,0.1)] hover:shadow-[0_0_20px_rgba(255,68,68,0.3)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export function TerminalButton({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: TerminalButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-md border font-terminal font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        glow && variant === 'primary' && 'shadow-[0_0_15px_rgba(0,255,65,0.4)]',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span className="opacity-0">{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}

function LoadingSpinner() {
  return (
    <motion.div
      className="absolute"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          strokeWidth="2"
          strokeDasharray="31.416"
          strokeDashoffset="10"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
