"use client";

import { motion } from "framer-motion";

type TypingTextProps = {
  text: string;
  className?: string;
  delay?: number;
};

export function TypingText({ text, className, delay = 0 }: TypingTextProps) {
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.018,
          },
        },
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={{
            hidden: {
              opacity: 0,
              y: 8,
              filter: "blur(4px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.25,
              },
            },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
