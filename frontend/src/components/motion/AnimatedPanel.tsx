"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type AnimatedPanelProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
};

export function AnimatedPanel({
  children,
  className,
  delay = 0,
  glow = true,
}: AnimatedPanelProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 26,
        scale: 0.97,
        filter: "blur(10px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: {
          duration: 0.22,
          ease: "easeOut",
        },
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        "relative rounded-3xl",
        glow
          ? "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-emerald-500/10 before:blur-2xl before:content-['']"
          : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}
