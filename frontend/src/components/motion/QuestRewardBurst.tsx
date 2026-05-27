"use client";

import { useEffect } from "react";
import { BadgeCheck, Gift, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type QuestRewardBurstProps = {
  visible: boolean;
  tier: string;
  amount: string;
  taskTitle?: string;
  onComplete?: () => void;
};

const particles = Array.from({ length: 10 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 10;

  return {
    id: index,
    x: Math.cos(angle) * 120,
    y: Math.sin(angle) * 86,
  };
});

function formatTier(tier: string) {
  return tier.replace("u8", "");
}

export function QuestRewardBurst({
  visible,
  tier,
  amount,
  taskTitle,
  onComplete,
}: QuestRewardBurstProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl"
            initial={{ scale: 0.45, opacity: 0 }}
            animate={{ scale: [0.8, 1.25, 1], opacity: [0, 0.9, 0] }}
            transition={{ duration: 2.1, ease: "easeOut" }}
          />

          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]"
              initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0.3, 1, 0.2],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.65, ease: "easeOut" }}
            />
          ))}

          <motion.div
            className="relative w-[min(340px,calc(100%-32px))] rounded-2xl border border-emerald-300/40 bg-zinc-950/95 p-5 text-center shadow-[0_0_70px_rgba(16,185,129,0.35)]"
            initial={{ scale: 0.8, y: 22, opacity: 0 }}
            animate={{
              scale: [0.8, 1.08, 1],
              y: [22, -8, 0],
              opacity: 1,
            }}
            exit={{ scale: 0.92, y: -18, opacity: 0 }}
            transition={{ duration: 0.72, ease: "easeOut" }}
          >
            <motion.div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: 1 }}
            >
              <Gift className="h-6 w-6" />
            </motion.div>

            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-200">
              <Sparkles className="h-4 w-4" />
              <p className="font-mono text-3xl font-semibold">+{amount}</p>
              <Sparkles className="h-4 w-4" />
            </div>

            <p className="mt-2 text-sm font-medium text-zinc-100">
              Tier {formatTier(tier)} Unlocked
            </p>

            {taskTitle ? (
              <p className="mt-2 text-xs text-zinc-400">
                {taskTitle} completed
              </p>
            ) : null}

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Next task unlocked
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
