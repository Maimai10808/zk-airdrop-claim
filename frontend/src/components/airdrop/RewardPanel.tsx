"use client";

import { useAirdropStore } from "@/stores/airdropStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedPanel,
  RecordCardMotion,
  StaggerContainer,
  StaggerItem,
  StatusPulse,
} from "@/components/motion";

export function RewardPanel() {
  const { rewards } = useAirdropStore();

  return (
    <AnimatedPanel>
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle>Reward Records</CardTitle>
        </CardHeader>

        <CardContent>
          {rewards.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-sm text-zinc-500">
              No reward records yet.
            </div>
          ) : (
            <StaggerContainer className="space-y-4">
              {rewards.map((reward) => (
                <StaggerItem key={reward.id}>
                  <RecordCardMotion className="p-5">
                    <div className="grid gap-4 md:grid-cols-[2fr_1fr_0.9fr_0.9fr] items-center">
                      <div>
                        <div className="font-mono text-sm text-zinc-200">
                          {reward.id}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {reward.isDevMock ? (
                            <Badge className="bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/10">
                              DEV MOCK reward
                            </Badge>
                          ) : null}
                          {reward.isDevnetRecord ? (
                            <Badge className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                              REAL DEVNET reward
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="font-mono text-sm text-zinc-200">
                        {reward.campaignId}
                      </div>
                      <div className="font-mono text-sm text-emerald-300">
                        {reward.amount}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <StatusPulse
                          label={reward.status}
                          tone={
                            reward.status === "spent"
                              ? "green"
                              : reward.status === "unspent"
                                ? "yellow"
                                : "yellow"
                          }
                        />
                        <div className="max-w-[220px] break-all font-mono text-xs text-zinc-300">
                          {reward.txId ?? "-"}
                        </div>
                      </div>
                    </div>
                  </RecordCardMotion>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </CardContent>
      </Card>
    </AnimatedPanel>
  );
}
