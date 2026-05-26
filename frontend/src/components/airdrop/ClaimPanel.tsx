"use client";

import { Gift, Loader2 } from "lucide-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { useAirdropStore } from "@/stores/airdropStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ClaimPanel() {
  const {
    selectedEligibility,
    isClaiming,
    claimStatus,
    claimError,
    lastTxId,
    claimSelectedEligibility,
  } = useAirdropStore();

  const handleClaim = async () => {
    await claimSelectedEligibility();
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Claim Reward</CardTitle>

        <Badge
          className={
            claimStatus === "confirmed"
              ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
              : claimStatus === "failed"
                ? "bg-red-500/10 text-red-300 hover:bg-red-500/10"
                : "bg-zinc-800 text-zinc-300"
          }
        >
          {claimStatus}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm leading-6 text-zinc-400">
            The claim action consumes one Eligibility record and generates a
            private Reward record. Current implementation uses a DEV MOCK
            transaction flow until the deployed Aleo program and real record
            scanner are connected.
          </p>

          <Button
            disabled={isClaiming || !selectedEligibility}
            onClick={handleClaim}
            className="mt-5 w-full bg-emerald-500 text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isClaiming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Gift className="mr-2 h-4 w-4" />
            )}
            {isClaiming ? "Generating Proof..." : "Claim Airdrop"}
          </Button>

          {!selectedEligibility ? (
            <p className="mt-3 text-center text-xs text-zinc-500">
              Scan and select an Eligibility record before claiming.
            </p>
          ) : null}

          {lastTxId ? (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-3">
              <p className="text-xs text-zinc-500">Last Transaction</p>
              <p className="mt-1 break-all font-mono text-xs text-emerald-300">
                {lastTxId}
              </p>
              {!lastTxId.startsWith("mock_") ? (
                <a
                  className="mt-2 inline-block text-xs text-emerald-300 underline"
                  href={`${ALEO_CONFIG.explorerBaseUrl}/transaction/${lastTxId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Explorer
                </a>
              ) : null}
            </div>
          ) : null}

          {claimError ? (
            <p className="mt-4 text-sm text-red-400">{claimError}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
