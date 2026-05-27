"use client";

import { motion } from "framer-motion";

type StatusPulseProps = {
  label: string;
  tone?: "green" | "yellow" | "red" | "blue" | "zinc";
  className?: string;
};

const toneClassName = {
  green: "bg-emerald-400 shadow-emerald-400/60",
  yellow: "bg-yellow-400 shadow-yellow-400/60",
  red: "bg-red-400 shadow-red-400/60",
  blue: "bg-sky-400 shadow-sky-400/60",
  zinc: "bg-zinc-400 shadow-zinc-400/60",
};

export function StatusPulse({
  label,
  tone = "green",
  className,
}: StatusPulseProps) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200",
        className ?? "",
      ].join(" ")}
    >
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className={[
            "absolute inline-flex h-full w-full rounded-full opacity-70",
            toneClassName[tone],
          ].join(" ")}
          animate={{
            scale: [1, 1.9, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <span
          className={[
            "relative inline-flex h-2.5 w-2.5 rounded-full shadow-lg",
            toneClassName[tone],
          ].join(" ")}
        />
      </span>
      {label}
    </div>
  );
}
