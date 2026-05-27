"use client";

import { motion } from "framer-motion";

export function ZkProofOrb() {
  return (
    <div className="relative h-48 w-48">
      <motion.div
        className="absolute inset-0 rounded-full border border-emerald-300/30"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-4 rounded-full border border-cyan-300/20"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-8 rounded-full bg-emerald-400/10 blur-xl"
        animate={{
          scale: [1, 1.18, 1],
          opacity: [0.55, 1, 0.55],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-300/40 to-cyan-300/20 shadow-2xl shadow-emerald-500/30"
        animate={{
          y: [0, -8, 0],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {[0, 1, 2, 3].map((item) => (
        <motion.span
          key={item}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-emerald-200 shadow-lg shadow-emerald-400/70"
          style={{
            transformOrigin: `${item % 2 === 0 ? 70 : 88}px ${item % 2 === 0 ? 70 : 88}px`,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 5 + item,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
