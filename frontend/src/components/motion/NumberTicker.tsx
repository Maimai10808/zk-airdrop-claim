"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

type NumberTickerProps = {
  value: string | number;
  suffix?: string;
  className?: string;
};

function parseLeoNumber(value: string | number) {
  if (typeof value === "number") {
    return value;
  }

  const matched = value.match(/[0-9]+/);
  return matched ? Number(matched[0]) : 0;
}

export function NumberTicker({ value, suffix, className }: NumberTickerProps) {
  const numericValue = useMemo(() => parseLeoNumber(value), [value]);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    Math.round(latest).toLocaleString(),
  );
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const unsubscribe = rounded.on("change", setDisplay);

    const controls = animate(motionValue, numericValue, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [motionValue, numericValue, rounded]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {display}
      {suffix ??
        (typeof value === "string" && value.includes("u64") ? "u64" : "")}
    </motion.span>
  );
}
