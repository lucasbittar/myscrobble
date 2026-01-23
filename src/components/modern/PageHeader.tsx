'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface PageHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
  rightContent?: ReactNode;
  filterRow?: ReactNode;
  className?: string;
}

export function PageHeader({
  subtitle,
  title,
  description,
  rightContent,
  filterRow,
  className = '',
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`mb-8 md:mb-12 ${className}`}
    >
      {/* Title Row - Stacked on mobile */}
      <div className="mb-6 md:mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs font-medium tracking-[1.5px] text-[#1DB954] uppercase mb-2"
        >
          {subtitle}
        </motion.p>
        <h1 className="text-3xl md:text-6xl font-black text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground">{description}</p>
        )}

        {rightContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            {rightContent}
          </motion.div>
        )}
      </div>

      {/* Filter Row */}
      {filterRow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          {filterRow}
        </motion.div>
      )}
    </motion.div>
  );
}
