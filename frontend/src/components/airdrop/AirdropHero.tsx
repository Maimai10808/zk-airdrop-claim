import { ShieldCheck, Sparkles, TicketCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MotionFadeUp,
  MotionSlideLeft,
  StaggerContainer,
  StaggerItem,
  TypingText,
  ZkProofOrb,
} from "@/components/motion";

export function AirdropHero() {
  return (
    <MotionSlideLeft className="overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_top_left,#064e3b,transparent_35%),#050505] p-8 text-white shadow-2xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <StaggerContainer className="flex flex-wrap gap-3">
            <StaggerItem>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                Aleo Zero-Knowledge Application
              </Badge>
            </StaggerItem>
          </StaggerContainer>

          <MotionFadeUp>
            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
              ZK Airdrop Claim
            </h1>
          </MotionFadeUp>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
            <TypingText
              text="Privacy-preserving airdrop system."
              className="font-semibold text-zinc-100"
              delay={0.08}
            />
            <span className="block mt-3 text-zinc-300">
              Users can prove eligibility and claim rewards without exposing
              identity, tier, or reward amount.
            </span>
          </p>

          <StaggerContainer className="mt-6 flex flex-wrap gap-3">
            {[
              "Private Records",
              "Eligibility Proof",
              "Reward Claim",
              "Public Campaign Stats",
            ].map((label) => (
              <StaggerItem key={label}>
                <Badge variant="secondary">{label}</Badge>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute -right-10 top-0 hidden lg:block">
            <ZkProofOrb />
          </div>

          <Card className="relative z-10 w-full max-w-sm border-zinc-800 bg-black/40 text-white backdrop-blur">
            <CardContent className="grid gap-4 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-zinc-300">
                  Private eligibility
                </span>
              </div>

              <div className="flex items-center gap-3">
                <TicketCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-zinc-300">
                  One-time claim guard
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-zinc-300">ZK reward record</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MotionSlideLeft>
  );
}
