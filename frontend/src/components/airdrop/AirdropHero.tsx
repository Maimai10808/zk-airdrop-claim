import { ShieldCheck, Sparkles, TicketCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AirdropHero() {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_top_left,#064e3b,transparent_35%),#050505] p-8 text-white shadow-2xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
            Aleo Zero-Knowledge Application
          </Badge>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            ZK Airdrop Claim
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
            A privacy-preserving airdrop system built on Aleo. Users can prove
            eligibility and claim rewards without exposing identity, tier, or
            reward amount.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="secondary">Private Records</Badge>
            <Badge variant="secondary">Eligibility Proof</Badge>
            <Badge variant="secondary">Reward Claim</Badge>
            <Badge variant="secondary">Public Campaign Stats</Badge>
          </div>
        </div>

        <Card className="border-zinc-800 bg-black/40 text-white backdrop-blur">
          <CardContent className="grid gap-4 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-zinc-300">Private eligibility</span>
            </div>

            <div className="flex items-center gap-3">
              <TicketCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-zinc-300">One-time claim guard</span>
            </div>

            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-zinc-300">ZK reward record</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
