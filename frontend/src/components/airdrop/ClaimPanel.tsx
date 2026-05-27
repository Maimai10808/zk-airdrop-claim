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
    campaign,
    executionMode,
    rawEligibilityRecord,
    rawRewardRecord,
    isClaiming,
    claimStatus,
    claimError,
    claimErrorDetails,
    lastTxId,
    claimTxId,
    claimSelectedEligibility,
  } = useAirdropStore();

  const handleClaim = async () => {
    await claimSelectedEligibility();
  };

  const isRealDevnetClaim =
    ALEO_CONFIG.isDevnet &&
    executionMode === "devnet" &&
    selectedEligibility?.isDevnetRecord;
  const missingParsedRecord = isRealDevnetClaim && !rawEligibilityRecord;

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
          {isRealDevnetClaim ? (
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
              REAL DEVNET: broadcasts claim_airdrop through local Leo CLI.
            </Badge>
          ) : (
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/10">
              DEV MOCK: This does not broadcast claim_airdrop yet.
            </Badge>
          )}

          <p className="text-sm leading-6 text-zinc-400">
            {isRealDevnetClaim
              ? "This claim consumes the issued Eligibility record on the local devnet and refreshes the real Campaign mapping after confirmation."
              : "The Campaign panel reads real Aleo mapping state. This claim action only simulates consuming one Eligibility record and creates a local mock Reward record."}
          </p>

          {isRealDevnetClaim &&
          campaign?.totalClaimedUsers &&
          campaign.totalClaimedUsers !== "0u64" ? (
            <p className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-200">
              This campaign already has claimed users. The local devnet demo
              uses one admin address, so claiming campaign 1u64 again can be
              rejected by the contract double-claim guard.
            </p>
          ) : null}

          <Button
            disabled={isClaiming || !selectedEligibility || missingParsedRecord}
            onClick={handleClaim}
            className="mt-5 w-full bg-emerald-500 text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isClaiming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Gift className="mr-2 h-4 w-4" />
            )}
            {isClaiming
              ? isRealDevnetClaim
                ? "Broadcasting Claim..."
                : "Generating Proof..."
              : isRealDevnetClaim
                ? "Claim on Local Devnet"
                : "Claim Airdrop"}
          </Button>

          {!selectedEligibility ? (
            <p className="mt-3 text-center text-xs text-zinc-500">
              Scan and select an Eligibility record before claiming.
            </p>
          ) : null}

          {missingParsedRecord ? (
            <p className="mt-3 text-center text-xs text-red-400">
              Eligibility record parsing failed. Please inspect
              issue_eligibility stdout.
            </p>
          ) : null}

          {claimTxId ?? lastTxId ? (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-3">
              <p className="text-xs text-zinc-500">
                {claimTxId ? "Claim transaction ID" : "Last Transaction"}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-emerald-300">
                {claimTxId ?? lastTxId}
              </p>
              {lastTxId && !lastTxId.startsWith("mock_") ? (
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

          {rawRewardRecord ? (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-3">
              <p className="text-xs text-zinc-500">Raw Reward record</p>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-200">
                {rawRewardRecord}
              </pre>
            </div>
          ) : null}

          {claimError ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-red-400">{claimError}</p>

              {claimErrorDetails ? (
                <details className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                  <summary className="cursor-pointer text-xs text-zinc-400">
                    Leo CLI details
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-300">
                    {claimErrorDetails}
                  </pre>
                </details>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
