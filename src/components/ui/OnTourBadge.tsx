"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type BadgeVariant = "indicator" | "compact" | "badge";

interface OnTourBadgeProps {
  className?: string;
  variant?: BadgeVariant;
  /** Only applies to variant="badge" */
  showText?: boolean;
}

/**
 * OnTourBadge - CRT-styled tour indicator
 *
 * Variants:
 * - `indicator`: Minimal glowing dot - perfect for small circular image overlays
 * - `compact`: Small pill badge without text - good for grid card overlays
 * - `badge`: Full badge with optional text - for inline/list views
 */
export function OnTourBadge({
  className,
  variant = "badge",
  showText = true,
}: OnTourBadgeProps) {
  const t = useTranslations("tour");

  // Indicator variant - minimal glowing dot
  if (variant === "indicator") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative flex items-center justify-center",
          className
        )}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute w-5 h-5 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,0,255,0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Inner dot with border */}
        <div
          className="relative w-3 h-3 rounded-full border-2 border-[#0a0a0a]"
          style={{
            background: "linear-gradient(135deg, #ff00ff 0%, #cc00cc 100%)",
            boxShadow: "0 0 8px #ff00ff, 0 0 16px rgba(255,0,255,0.5), inset 0 1px 2px rgba(255,255,255,0.3)",
          }}
        >
          {/* Highlight */}
          <div
            className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/40"
          />
        </div>
      </motion.div>
    );
  }

  // Compact variant - small pill without text
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full",
          "bg-[#0a0a0a]/90 border border-[var(--crt-magenta)]/60",
          className
        )}
        style={{
          boxShadow: "0 0 8px rgba(255,0,255,0.4), inset 0 0 6px rgba(255,0,255,0.15)",
        }}
      >
        {/* Pulsing dot */}
        <span className="relative flex h-1.5 w-1.5">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full bg-[var(--crt-magenta)]"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.9, 0.3, 0.9]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--crt-magenta)]"
            style={{ boxShadow: "0 0 4px var(--crt-magenta)" }}
          />
        </span>
        {/* Mini icon */}
        <span
          className="font-terminal text-[8px] leading-none text-[var(--crt-magenta)] tracking-tight"
          style={{ textShadow: "0 0 6px var(--crt-magenta)" }}
        >
          LIVE
        </span>
      </motion.div>
    );
  }

  // Badge variant - full badge with text
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-terminal",
        "bg-[#0a0a0a]/90 border border-[var(--crt-magenta)]/50",
        "text-[var(--crt-magenta)]",
        "px-2.5 py-1 text-[10px]",
        className
      )}
      style={{
        textShadow: "0 0 8px var(--crt-magenta)",
        boxShadow:
          "0 0 12px rgba(255,0,255,0.35), inset 0 0 8px rgba(255,0,255,0.1)",
      }}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-[var(--crt-magenta)] opacity-75"
          animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0.25, 0.75] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span
          className="relative inline-flex h-2 w-2 rounded-full bg-[var(--crt-magenta)]"
          style={{ boxShadow: "0 0 4px var(--crt-magenta)" }}
        />
      </span>
      {showText && (
        <span className="uppercase tracking-widest font-bold">
          {t("onTour")}
        </span>
      )}
    </motion.div>
  );
}
