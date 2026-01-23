'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSkeletonProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  /** Custom skeleton className for styling */
  skeletonClassName?: string;
  /** Fallback element when image fails to load */
  fallback?: React.ReactNode;
}

/**
 * Image component with built-in loading skeleton.
 * Shows a glass-morphism skeleton while the image loads,
 * then smoothly fades it out once the image is ready.
 */
export function ImageSkeleton({
  skeletonClassName,
  fallback,
  className,
  ...imageProps
}: ImageSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      {/* Actual Image */}
      <Image
        {...imageProps}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Loading Skeleton Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`absolute inset-0 bg-white/50 dark:bg-white/5 animate-pulse ${skeletonClassName || ''}`}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
