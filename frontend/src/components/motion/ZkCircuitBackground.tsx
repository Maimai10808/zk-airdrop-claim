"use client";

import { motion } from "framer-motion";

const nodes = [
  { x: "8%", y: "18%", size: 5, delay: 0 },
  { x: "24%", y: "68%", size: 4, delay: 0.2 },
  { x: "42%", y: "28%", size: 6, delay: 0.4 },
  { x: "58%", y: "74%", size: 4, delay: 0.6 },
  { x: "76%", y: "22%", size: 5, delay: 0.8 },
  { x: "88%", y: "58%", size: 7, delay: 1 },
];

export function ZkCircuitBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
      <motion.div
        className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[-20%] right-[-10%] h-[480px] w-[480px] rounded-full bg-cyan-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-30">
        <defs>
          <linearGradient id="zk-line" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(52 211 153)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(52 211 153)" stopOpacity="0.65" />
            <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d="M 100 180 C 280 80, 420 320, 620 180 S 900 90, 1100 260"
          fill="none"
          stroke="url(#zk-line)"
          strokeWidth="1"
          strokeDasharray="8 12"
          animate={{
            strokeDashoffset: [0, -120],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.path
          d="M 160 620 C 360 460, 520 760, 720 580 S 980 520, 1180 700"
          fill="none"
          stroke="url(#zk-line)"
          strokeWidth="1"
          strokeDasharray="6 14"
          animate={{
            strokeDashoffset: [0, 140],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </svg>

      {nodes.map((node, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-emerald-300 shadow-lg shadow-emerald-400/60"
          style={{
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size,
          }}
          animate={{
            y: [0, -14, 0],
            opacity: [0.35, 1, 0.35],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: node.delay,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(9,9,11,0.88)_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />
    </div>
  );
}
