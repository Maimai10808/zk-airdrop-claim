"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type RecordCardMotionProps = {
  children: ReactNode;
  className?: string;
};

export function RecordCardMotion({
  children,
  className,
}: RecordCardMotionProps) {
  return (
    <motion.div
      className={[
        "relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70",
        className ?? "",
      ].join(" ")}
      initial={{
        opacity: 0,
        y: 20,
        rotateX: -8,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
      }}
      whileHover={{
        y: -3,
        borderColor: "rgba(52, 211, 153, 0.35)",
      }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        transformPerspective: 900,
      }}
    >
      <motion.div
        className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {children}
    </motion.div>
  );
}
