"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

import { motion } from "framer-motion";

type AnimatedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;

  className?: string;
};

export function AnimatedButton({
  children,

  className,

  disabled,

  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.025,

              y: -1,
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.96,

              y: 0,
            }
      }
      transition={{
        type: "spring",

        stiffness: 420,

        damping: 26,
      }}
      className={[
        "relative overflow-hidden rounded-2xl px-4 py-2 text-sm font-medium",

        "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200",

        "shadow-lg shadow-emerald-950/30",

        "before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:skew-x-[-20deg] before:bg-white/20 before:content-['']",

        "hover:before:animate-[shine_0.9s_ease]",

        "disabled:cursor-not-allowed disabled:opacity-50",

        className ?? "",
      ].join(" ")}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
