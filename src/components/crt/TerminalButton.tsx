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
    'bg-primary text-primary-foreground hover:brightness-90 border-primary hover:shadow-[0_0_20px_var(--primary)/50]',
  secondary:
    'bg-transparent text-accent border-accent hover:bg-accent/10 hover:shadow-[0_0_20px_var(--accent)/30]',
  ghost:
    'bg-transparent text-foreground border-transparent hover:border-primary/30 hover:text-primary',
  danger:
    'bg-transparent text-destructive border-destructive hover:bg-destructive/10 hover:shadow-[0_0_20px_var(--destructive)/30]',
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        glow && variant === 'primary' && 'shadow-[0_0_15px_var(--primary)/40]',
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
