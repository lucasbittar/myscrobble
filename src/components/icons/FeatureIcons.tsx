"use client";

import { motion } from "framer-motion";

// Listening Stats Icon - Animated frequency bars (equalizer)
export function ListeningStatsIcon() {
  const barHeights = [0.4, 0.7, 1, 0.6, 0.8];
  return (
    <div className="relative w-8 h-8 flex items-end justify-center gap-[3px]">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,65,0.03)_2px,rgba(0,255,65,0.03)_4px)] pointer-events-none rounded" />
      {barHeights.map((height, i) => (
        <motion.div
          key={i}
          className="w-[4px] rounded-t-sm origin-bottom"
          style={{
            background: "linear-gradient(to top, #00ff41, rgba(0,255,65,0.6))",
            boxShadow: "0 0 8px rgba(0,255,65,0.6)",
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
          background: "radial-gradient(circle, #00f5ff 0%, rgba(0,245,255,0.4) 70%)",
          boxShadow: "0 0 12px rgba(0,245,255,0.8), 0 0 24px rgba(0,245,255,0.4)",
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
            background: "#00f5ff",
            boxShadow: "0 0 6px #00f5ff",
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
            stroke="#00f5ff"
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
          background: "linear-gradient(to top, rgba(255,0,255,0.8), transparent)",
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
          background: "linear-gradient(to top, rgba(255,0,255,0.8), transparent)",
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
          background: "radial-gradient(circle, #ff00ff 0%, rgba(255,0,255,0) 70%)",
          boxShadow: "0 0 16px rgba(255,0,255,0.8)",
        }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Stage floor line */}
      <div
        className="absolute bottom-1 left-1 right-1 h-[2px] rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, #ff00ff, transparent)",
          boxShadow: "0 0 4px #ff00ff",
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
          background: "#ff00ff",
          boxShadow: "0 0 8px #ff00ff",
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
            borderTopColor: "#ff00ff",
            borderRightColor: "#ff00ff",
            transform: "rotate(-45deg)",
            boxShadow: `0 0 ${4 + i * 2}px rgba(255,0,255,0.4)`,
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
          borderBottom: "4px solid #ff00ff",
          filter: "drop-shadow(0 0 3px #ff00ff)",
        }}
        animate={{ y: [0, -2, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
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
          borderTopColor: "#ffb000",
          borderRightColor: "rgba(255,176,0,0.3)",
          boxShadow: "0 0 8px rgba(255,176,0,0.4)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner counter-rotating ring */}
      <motion.div
        className="absolute w-5 h-5 rounded-full border-2 border-transparent"
        style={{
          borderBottomColor: "#ffb000",
          borderLeftColor: "rgba(255,176,0,0.5)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Center pulsing core */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full"
        style={{
          background: "radial-gradient(circle, #ffb000 0%, rgba(255,176,0,0.6) 70%)",
          boxShadow: "0 0 10px #ffb000, 0 0 20px rgba(255,176,0,0.4)",
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orbiting sparkles */}
      {[0, 90, 180, 270].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#ffb000]"
          style={{
            boxShadow: "0 0 4px #ffb000",
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
          borderRight: "4px solid #ffb000",
          filter: "drop-shadow(0 0 2px #ffb000)",
          left: "2px",
        }}
        animate={{ opacity: [0.4, 1, 0.4], x: [-1, 1, -1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
