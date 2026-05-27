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

function shortAddress(address: string) {
  if (address.length <= 16) {
    return address;
  }

  return `${address.slice(0, 9)}...${address.slice(-5)}`;
}

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
                    <div className="space-y-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
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

                          <div className="mt-3">
                            <div className="text-xs text-zinc-500">Account</div>
                            <div className="mt-1 text-sm font-medium text-zinc-100">
                              {reward.accountLabel ??
                                shortAddress(reward.owner)}
                            </div>
                            <div className="mt-1 break-all font-mono text-xs leading-5 text-zinc-500">
                              {shortAddress(reward.owner)}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <StatusPulse
                            label={reward.status}
                            tone={
                              reward.status === "spent" ? "green" : "yellow"
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-4 sm:grid-cols-2 lg:grid-cols-[0.7fr_0.55fr_0.8fr_0.75fr_2.5fr]">
                        <div>
                          <div className="text-xs text-zinc-500">Campaign</div>
                          <div className="mt-1 font-mono text-sm text-zinc-200">
                            {reward.campaignId}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500">Tier</div>
                          <div className="mt-1 font-mono text-sm text-emerald-300">
                            {reward.eligibilityTier ?? "-"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500">Amount</div>
                          <div className="mt-1 font-mono text-sm text-emerald-300">
                            {reward.amount}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-zinc-500">
                            Completed Tasks
                          </div>
                          <div className="mt-1 font-mono text-sm text-zinc-200">
                            {reward.completedTaskIds?.length ?? "-"}
                          </div>
                        </div>

                        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                          <div className="text-xs text-zinc-500">Tx ID</div>
                          <div className="mt-1 break-all font-mono text-xs leading-5 text-zinc-300">
                            {reward.txId ?? "-"}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/80 pt-3">
                        <div className="text-xs text-zinc-500">
                          Local Record ID
                        </div>
                        <div className="mt-1 break-all font-mono text-xs leading-5 text-zinc-500">
                          {reward.id}
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
