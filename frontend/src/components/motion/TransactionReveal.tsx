"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type TransactionRevealProps = {
  children: ReactNode;
  className?: string;
};

export function TransactionReveal({
  children,
  className,
}: TransactionRevealProps) {
  return (
    <motion.div
      className={[
        "relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4",
        className ?? "",
      ].join(" ")}
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent"
        initial={{ x: "-120%" }}
        animate={{ x: "360%" }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-300"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [1, 0.35, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
