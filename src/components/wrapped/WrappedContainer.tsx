'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WrappedBackground, GradientConfig } from './WrappedBackground';
import { WrappedProgressBar } from './WrappedProgressBar';

interface WrappedContainerProps {
  children: React.ReactNode[];
  gradients: GradientConfig[];
  onSlideChange?: (index: number) => void;
  onClose?: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

// Custom cursor SVGs as data URLs
const cursorLeft = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 18l-6-6 6-6'/%3E%3C/svg%3E") 16 16, pointer`;
const cursorRight = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18l6-6-6-6'/%3E%3C/svg%3E") 16 16, pointer`;

export function WrappedContainer({
  children,
  gradients,
  onSlideChange,
  onClose,
}: WrappedContainerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [cursorSide, setCursorSide] = useState<'left' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement>(null);
  const totalSlides = children.length;

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      onSlideChange?.(index);
    }
  }, [currentSlide, totalSlides, onSlideChange]);

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onClose?.();
    }
  }, [currentSlide, totalSlides, goToSlide, onClose]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStart(null);
  };

  // Mouse move handler for cursor direction
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const threshold = rect.width * 0.5;

    setCursorSide(x < threshold ? 'left' : 'right');
  };

  // Click navigation (50% left = prev, 50% right = next)
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const threshold = rect.width * 0.5;

    if (x < threshold) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const currentGradient = gradients[currentSlide] || gradients[0];

  // Determine cursor based on position and slide availability
  const getCursor = () => {
    if (cursorSide === 'left') {
      return currentSlide > 0 ? cursorLeft : 'default';
    }
    return currentSlide < totalSlides - 1 ? cursorRight : 'default';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background */}
      <WrappedBackground gradient={currentGradient} />

      {/* Progress bar */}
      <WrappedProgressBar
        current={currentSlide}
        total={totalSlides}
        onDotClick={goToSlide}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="cursor-pointer absolute top-4 right-4 z-50 p-2 text-white/60 hover:text-white transition-colors safe-area-top"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Slide content */}
      <div
        ref={containerRef}
        className="relative z-10 h-full w-full"
        style={{ cursor: getCursor() }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 flex items-center justify-center px-6 py-16"
          >
            {children[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation hints (desktop) */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/40 text-sm gap-4">
        <span>← Previous</span>
        <span className="text-white/20">|</span>
        <span>Next →</span>
      </div>
    </div>
  );
}
