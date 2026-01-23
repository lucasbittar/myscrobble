"use client";

import { motion } from "framer-motion";

// Listening Stats Icon - Animated frequency bars (equalizer)
export function ListeningStatsIcon() {
  const barHeights = [0.4, 0.7, 1, 0.6, 0.8];
  return (
    <div className="relative w-8 h-8 flex items-end justify-center gap-[3px]">
      {barHeights.map((height, i) => (
        <motion.div
          key={i}
          className="w-[4px] rounded-t-sm origin-bottom"
          style={{
            background: "linear-gradient(to top, #1DB954, #1ed760)",
            boxShadow: "0 2px 8px rgba(29,185,84,0.3)",
          }}
          animate={{
            height: [`${height * 100}%`, `${height * 60}%`, `${height * 100}%`],
          }}
          transition={{
            duration: 0.8 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// AI Discover Icon - Neural spark with synaptic pulses
export function AIDiscoverIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Central node */}
      <motion.div
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: "radial-gradient(circle, #8B5CF6 0%, rgba(139,92,246,0.4) 70%)",
          boxShadow: "0 2px 12px rgba(139,92,246,0.5)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orbiting sparks */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: "#3B82F6",
            boxShadow: "0 1px 4px rgba(59,130,246,0.4)",
            transformOrigin: "center",
          }}
          animate={{
            x: [
              Math.cos((angle * Math.PI) / 180) * 10,
              Math.cos(((angle + 30) * Math.PI) / 180) * 12,
              Math.cos((angle * Math.PI) / 180) * 10,
            ],
            y: [
              Math.sin((angle * Math.PI) / 180) * 10,
              Math.sin(((angle + 30) * Math.PI) / 180) * 12,
              Math.sin((angle * Math.PI) / 180) * 10,
            ],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 2 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 32">
        {[0, 120, 240].map((angle, i) => (
          <motion.line
            key={i}
            x1="16"
            y1="16"
            x2={16 + Math.cos((angle * Math.PI) / 180) * 12}
            y2={16 + Math.sin((angle * Math.PI) / 180) * 12}
            stroke="#8B5CF6"
            strokeWidth="1"
            strokeOpacity="0.3"
            animate={{ strokeOpacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}

// Concerts Icon - Stage spotlights converging
export function ConcertsIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden">
      {/* Left spotlight beam */}
      <motion.div
        className="absolute bottom-0 left-1 w-3 h-6 origin-bottom"
        style={{
          background: "linear-gradient(to top, rgba(236,72,153,0.8), transparent)",
          clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
          filter: "blur(1px)",
        }}
        animate={{
          rotate: [-15, -10, -15],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Right spotlight beam */}
      <motion.div
        className="absolute bottom-0 right-1 w-3 h-6 origin-bottom"
        style={{
          background: "linear-gradient(to top, rgba(236,72,153,0.8), transparent)",
          clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
          filter: "blur(1px)",
        }}
        animate={{
          rotate: [15, 10, 15],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      {/* Center glow burst */}
      <motion.div
        className="absolute bottom-1 w-4 h-4 rounded-full"
        style={{
          background: "radial-gradient(circle, #EC4899 0%, rgba(236,72,153,0) 70%)",
          boxShadow: "0 2px 16px rgba(236,72,153,0.5)",
        }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Stage floor line */}
      <div
        className="absolute bottom-1 left-1 right-1 h-[2px] rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, #EC4899, transparent)",
          boxShadow: "0 1px 4px rgba(236,72,153,0.4)",
        }}
      />
    </div>
  );
}

// Share Icon - Broadcasting signal arcs
export function ShareIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Central broadcast point */}
      <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: "#3B82F6",
          boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Signal arcs */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-transparent"
          style={{
            width: 12 + i * 8,
            height: 12 + i * 8,
            borderTopColor: "#3B82F6",
            borderRightColor: "#3B82F6",
            transform: "rotate(-45deg)",
            boxShadow: `0 1px ${2 + i}px rgba(59,130,246,0.2)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.3,
          }}
        />
      ))}
      {/* Upward arrow hint */}
      <motion.div
        className="absolute -top-0.5 w-0 h-0"
        style={{
          borderLeft: "3px solid transparent",
          borderRight: "3px solid transparent",
          borderBottom: "4px solid #3B82F6",
          filter: "drop-shadow(0 1px 2px rgba(59,130,246,0.3))",
        }}
        animate={{ y: [0, -2, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Podcasts Icon - Microphone with pulsing sound waves
export function PodcastsIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Microphone base */}
      <motion.div
        className="absolute w-3.5 h-5 rounded-t-full"
        style={{
          background: "linear-gradient(180deg, #8B5CF6 0%, #7C3AED 100%)",
          boxShadow: "0 2px 10px rgba(139,92,246,0.3)",
          top: "4px",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Microphone stand */}
      <div
        className="absolute w-[2px] h-2 rounded-full"
        style={{
          background: "#8B5CF6",
          bottom: "4px",
        }}
      />
      <div
        className="absolute w-3 h-[2px] rounded-full"
        style={{
          background: "#8B5CF6",
          bottom: "4px",
        }}
      />
      {/* Sound waves */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-transparent"
          style={{
            width: 16 + i * 6,
            height: 16 + i * 6,
            borderTopColor: "#8B5CF6",
            borderRightColor: "#8B5CF6",
            transform: "rotate(45deg)",
            top: 6 - i * 3,
            right: 2 - i * 3,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// Wrapped Icon - Spiral time rewind with sparkles
export function WrappedIcon() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute w-7 h-7 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: "#F59E0B",
          borderRightColor: "rgba(245,158,11,0.3)",
          boxShadow: "0 2px 8px rgba(245,158,11,0.2)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner counter-rotating ring */}
      <motion.div
        className="absolute w-5 h-5 rounded-full border-2 border-transparent"
        style={{
          borderBottomColor: "#F59E0B",
          borderLeftColor: "rgba(245,158,11,0.5)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Center pulsing core */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full"
        style={{
          background: "radial-gradient(circle, #F59E0B 0%, rgba(245,158,11,0.6) 70%)",
          boxShadow: "0 2px 10px rgba(245,158,11,0.4)",
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orbiting sparkles */}
      {[0, 90, 180, 270].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#F59E0B]"
          style={{
            boxShadow: "0 1px 4px rgba(245,158,11,0.4)",
          }}
          animate={{
            x: [
              Math.cos((angle * Math.PI) / 180) * 11,
              Math.cos(((angle + 90) * Math.PI) / 180) * 11,
            ],
            y: [
              Math.sin((angle * Math.PI) / 180) * 11,
              Math.sin(((angle + 90) * Math.PI) / 180) * 11,
            ],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.25,
          }}
        />
      ))}
      {/* Rewind arrow hints */}
      <motion.div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          borderTop: "3px solid transparent",
          borderBottom: "3px solid transparent",
          borderRight: "4px solid #F59E0B",
          filter: "drop-shadow(0 1px 2px rgba(245,158,11,0.3))",
          left: "2px",
        }}
        animate={{ opacity: [0.4, 1, 0.4], x: [-1, 1, -1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
