"use client";

import { useEffect } from "react";
import { Gift, Sparkles, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type QuestCompletionBurstProps = {
  visible: boolean;
  amount: string;
  tier: string;
  onComplete?: () => void;
};

const particles = Array.from({ length: 22 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 22;
  const distance = index % 2 === 0 ? 158 : 118;

  return {
    id: index,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.72,
    color:
      index % 3 === 0
        ? "bg-yellow-300"
        : index % 3 === 1
          ? "bg-emerald-300"
          : "bg-cyan-300",
  };
});

export function QuestCompletionBurst({
  visible,
  amount,
  tier,
  onComplete,
}: QuestCompletionBurstProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.24),rgba(16,185,129,0.16),transparent_68%)] blur-2xl"
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: [0.75, 1.22, 1], opacity: [0, 1, 0.35] }}
            transition={{ duration: 3.2, ease: "easeOut" }}
          />

          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-emerald-300/25"
              style={{
                width: 180 + ring * 70,
                height: 180 + ring * 70,
              }}
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{
                scale: [0.75, 1, 1.08],
                opacity: [0, 0.75, 0],
                rotate: ring % 2 === 0 ? 360 : -360,
              }}
              transition={{ duration: 3.4, ease: "easeOut" }}
            />
          ))}

          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className={[
                "absolute h-2.5 w-2.5 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.7)]",
                particle.color,
              ].join(" ")}
              initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0.2, 1.25, 0.15],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2.6, ease: "easeOut" }}
            />
          ))}

          <motion.div
            className="relative w-[min(390px,calc(100%-28px))] rounded-3xl border border-yellow-300/40 bg-zinc-950/95 p-6 text-center shadow-[0_0_90px_rgba(250,204,21,0.28),0_0_120px_rgba(20,184,166,0.2)]"
            initial={{ scale: 0.72, y: 32, opacity: 0 }}
            animate={{
              scale: [0.72, 1.1, 1],
              y: [32, -10, 0],
              opacity: 1,
            }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/50 bg-yellow-300/15 text-yellow-200"
              animate={{
                rotate: [0, -10, 10, 0],
                scale: [1, 1.12, 1],
              }}
              transition={{ duration: 1.35, repeat: 1 }}
            >
              <Trophy className="h-8 w-8" />
            </motion.div>

            <div className="mt-5 flex items-center justify-center gap-2 text-yellow-200">
              <Sparkles className="h-4 w-4" />
              <p className="text-2xl font-semibold">Max Tier Achieved</p>
              <Sparkles className="h-4 w-4" />
            </div>

            <p className="mt-2 text-sm text-emerald-200">
              Full Eligibility Unlocked
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3">
                <p className="text-xs text-yellow-100/70">Tier</p>
                <p className="mt-1 font-mono text-lg text-yellow-200">{tier}</p>
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p className="text-xs text-emerald-100/70">Claimable</p>
                <p className="mt-1 font-mono text-lg text-emerald-200">
                  {amount}
                </p>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              <Gift className="h-3.5 w-3.5" />
              1000u64 Claimable
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
