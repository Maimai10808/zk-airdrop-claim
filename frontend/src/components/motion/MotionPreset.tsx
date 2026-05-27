"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

type MotionPresetProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -28,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 28,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.82,
    rotate: -2,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
      mass: 0.8,
    },
  },
};

export function MotionFadeUp({
  children,
  className,
  delay = 0,
}: MotionPresetProps) {
  return (
    <motion.div
      className={className}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function MotionFadeIn({
  children,
  className,
  delay = 0,
}: MotionPresetProps) {
  return (
    <motion.div
      className={className}
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function MotionScaleIn({
  children,
  className,
  delay = 0,
}: MotionPresetProps) {
  return (
    <motion.div
      className={className}
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function MotionSlideLeft({
  children,
  className,
  delay = 0,
}: MotionPresetProps) {
  return (
    <motion.div
      className={className}
      variants={slideLeftVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function MotionSlideRight({
  children,
  className,
  delay = 0,
}: MotionPresetProps) {
  return (
    <motion.div
      className={className}
      variants={slideRightVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function MotionPop({
  children,
  className,
  delay = 0,
}: MotionPresetProps) {
  return (
    <motion.div
      className={className}
      variants={popVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
