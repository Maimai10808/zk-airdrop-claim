"use client";

import { Gift, Loader2 } from "lucide-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { AIRDROP_TASKS } from "@/constants/airdropTasks";
import { useAirdropStore } from "@/stores/airdropStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedPanel,
  StatusPulse,
  TransactionReveal,
} from "@/components/motion";
import { motion } from "framer-motion";

export function ClaimPanel() {
  const {
    selectedEligibility,
    campaign,
    executionMode,
    rawEligibilityRecord,
    rawRewardRecord,
    selectedDevnetAccount,
    accountClaimStatus,
    accountClaimKey,
    accountClaimStatusError,
    isClaiming,
    claimStatus,
    claimError,
    claimErrorDetails,
    lastTxId,
    claimTxId,
    claimSelectedEligibility,
  } = useAirdropStore();

  const selectedTaskCount = selectedEligibility?.completedTaskIds?.length ?? 0;
  const selectedTier =
    selectedEligibility?.eligibilityTier ?? selectedEligibility?.tier ?? "-";
  const selectedAmount = selectedEligibility?.amount ?? "-";

  const handleClaim = async () => {
    await claimSelectedEligibility();
  };

  const isRealDevnetClaim =
    ALEO_CONFIG.isDevnet &&
    executionMode === "devnet" &&
    selectedEligibility?.isDevnetRecord;
  const missingParsedRecord = isRealDevnetClaim && !rawEligibilityRecord;
  const missingDevnetAccount = ALEO_CONFIG.isDevnet && !selectedDevnetAccount;
  const selectedAccountMismatch =
    Boolean(isRealDevnetClaim && selectedDevnetAccount && selectedEligibility) &&
    selectedEligibility?.owner !== selectedDevnetAccount?.address;
  const claimDisabledByAccountStatus =
    ALEO_CONFIG.isDevnet && accountClaimStatus !== "not_claimed";
  const claimDisabled =
    isClaiming ||
    !selectedEligibility ||
    missingParsedRecord ||
    missingDevnetAccount ||
    selectedAccountMismatch ||
    claimDisabledByAccountStatus;

  const accountStatusLabel =
    accountClaimStatus === "checking"
      ? "Checking claim status..."
      : accountClaimStatus === "not_claimed"
        ? "Not Claimed"
        : accountClaimStatus === "claimed"
          ? "Already Claimed"
          : accountClaimStatus === "error"
            ? "Status Error"
            : "Unknown";

  const accountStatusTone =
    accountClaimStatus === "not_claimed"
      ? "green"
      : accountClaimStatus === "claimed" || accountClaimStatus === "error"
        ? "red"
        : accountClaimStatus === "checking"
          ? "blue"
          : "zinc";

  return (
    <AnimatedPanel>
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Claim Reward</CardTitle>

          <StatusPulse
            label={claimStatus}
            tone={
              claimStatus === "confirmed"
                ? "green"
                : claimStatus === "failed"
                  ? "red"
                  : "yellow"
            }
          />
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

            {ALEO_CONFIG.isDevnet ? (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-3">
                <p className="text-xs text-zinc-500">Selected Account</p>
                <p className="mt-1 text-sm font-medium text-zinc-200">
                  {selectedDevnetAccount?.label ?? "No account selected"}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-emerald-300">
                  {selectedDevnetAccount?.address ?? "-"}
                </p>
                <div className="mt-3">
                  <StatusPulse
                    label={accountStatusLabel}
                    tone={accountStatusTone}
                  />
                </div>
                {accountClaimKey ? (
                  <p className="mt-3 break-all font-mono text-[11px] leading-5 text-zinc-500">
                    Claim Key: {accountClaimKey}
                  </p>
                ) : null}
                {accountClaimStatusError ? (
                  <p className="mt-3 text-xs text-red-400">
                    {accountClaimStatusError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {selectedEligibility ? (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-3">
                <p className="text-xs text-zinc-500">Selected Eligibility</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">Tasks</p>
                    <p className="font-mono text-xs text-zinc-200">
                      {selectedEligibility.completedTaskIds?.length ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Tier</p>
                    <p className="font-mono text-xs text-emerald-300">
                      {selectedEligibility.eligibilityTier ??
                        selectedEligibility.tier}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Amount</p>
                    <p className="font-mono text-xs text-emerald-300">
                      {selectedEligibility.amount}
                    </p>
                  </div>
                </div>
                {selectedEligibility.completedTaskIds ? (
                  <p className="mt-3 text-xs text-zinc-400">
                    This eligibility was generated from confirmed task
                    progress.
                  </p>
                ) : null}
                {selectedTaskCount < AIRDROP_TASKS.length ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    This eligibility uses tier {selectedTier} and amount{" "}
                    {selectedAmount}.
                  </p>
                ) : null}
              </div>
            ) : null}

            {isRealDevnetClaim &&
            accountClaimStatus === "not_claimed" &&
            campaign?.totalClaimedUsers &&
            campaign.totalClaimedUsers !== "0u64" ? (
              <p className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-200">
                Other accounts may have already claimed this campaign. The
                current selected account can still claim if its status is Not
                Claimed.
              </p>
            ) : null}

            <motion.div
              className="w-full"
              whileHover={claimDisabled ? undefined : { y: -2 }}
              whileTap={claimDisabled ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
            >
              <Button
                disabled={claimDisabled}
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
            </motion.div>

            {!selectedEligibility && accountClaimStatus !== "claimed" ? (
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

            {missingDevnetAccount ? (
              <p className="mt-3 text-center text-xs text-zinc-500">
                Select a devnet account first.
              </p>
            ) : null}

            {ALEO_CONFIG.isDevnet && accountClaimStatus === "claimed" ? (
              <p className="mt-3 text-center text-xs text-red-400">
                This selected account has already claimed this campaign.
              </p>
            ) : null}

            {ALEO_CONFIG.isDevnet && accountClaimStatus === "checking" ? (
              <p className="mt-3 text-center text-xs text-zinc-500">
                Checking claim status...
              </p>
            ) : null}

            {ALEO_CONFIG.isDevnet &&
            (accountClaimStatus === "unknown" ||
              accountClaimStatus === "error") ? (
              <p className="mt-3 text-center text-xs text-red-400">
                Refresh claim status before claiming.
              </p>
            ) : null}

            {selectedAccountMismatch ? (
              <p className="mt-3 text-center text-xs text-red-400">
                This Eligibility record belongs to another selected account.
                Switch back or issue a new record.
              </p>
            ) : null}

            {(claimTxId ?? lastTxId) ? (
              <TransactionReveal className="mt-4">
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
              </TransactionReveal>
            ) : null}

            {rawRewardRecord ? (
              <TransactionReveal className="mt-4">
                {selectedDevnetAccount ? (
                  <p className="mb-2 text-xs text-zinc-500">
                    Account: {selectedDevnetAccount.label}
                  </p>
                ) : null}
                <p className="text-xs text-zinc-500">Raw Reward record</p>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-200">
                  {rawRewardRecord}
                </pre>
              </TransactionReveal>
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
    </AnimatedPanel>
  );
}
