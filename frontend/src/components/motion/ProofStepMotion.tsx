"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type ProofStepMotionProps = {
  children: ReactNode;
  index?: number;
  active?: boolean;
  className?: string;
};

export function ProofStepMotion({
  children,
  index = 0,
  active = false,
  className,
}: ProofStepMotionProps) {
  return (
    <motion.div
      className={[
        "relative rounded-2xl",
        active ? "shadow-lg shadow-emerald-950/30" : "",
        className ?? "",
      ].join(" ")}
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {active ? (
        <motion.div
          className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-r from-emerald-400/30 via-cyan-400/20 to-emerald-400/30 blur-sm"
          animate={{
            opacity: [0.35, 0.85, 0.35],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ) : null}

      {children}
    </motion.div>
  );
}
