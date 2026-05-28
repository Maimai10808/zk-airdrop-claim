"use client";

import { useState } from "react";
import { LockKeyhole, Loader2, ScanLine, TicketCheck } from "lucide-react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { AIRDROP_TASKS } from "@/constants/airdropTasks";
import { useAirdropStore } from "@/stores/airdropStore";
import { ConfirmEligibilityIssueDialog } from "@/components/airdrop/ConfirmEligibilityIssueDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedPanel,
  RecordCardMotion,
  StaggerContainer,
  StaggerItem,
  TransactionReveal,
} from "@/components/motion";
import { motion } from "framer-motion";

export function EligibilityPanel() {
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const walletState = useWallet();
  const { address, connected } = walletState as any;

  const {
    campaignId,
    eligibilityRecords,
    selectedEligibility,
    issueTxId,
    rawEligibilityRecord,
    selectedDevnetAccount,
    accountClaimStatus,
    completedTaskIds,
    taskEligibility,
    isScanning,
    scanError,
    scanEligibility,
    useMockEligibilityFallback,
    selectEligibility,
  } = useAirdropStore();

  const executeIssueEligibility = async () => {
    if (!ALEO_CONFIG.isDevnet && (!connected || !address)) {
      alert("Please connect your Aleo wallet first.");
      return;
    }

    await scanEligibility(address ?? selectedDevnetAccount?.address ?? "", campaignId);
  };

  const handleIssueClick = () => {
    if (issueDisabled) {
      return;
    }

    setShowIssueDialog(true);
  };

  const handleConfirmIssue = async () => {
    setShowIssueDialog(false);
    await executeIssueEligibility();
  };

  const needsDevnetAccount = ALEO_CONFIG.isDevnet && !selectedDevnetAccount;
  const issueDisabledByClaimStatus =
    ALEO_CONFIG.isDevnet && accountClaimStatus !== "not_claimed";
  const issueDisabledByTasks =
    ALEO_CONFIG.isDevnet && !taskEligibility.isEligible;
  const issueDisabled =
    isScanning ||
    needsDevnetAccount ||
    issueDisabledByClaimStatus ||
    issueDisabledByTasks;

  return (
    <AnimatedPanel>
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle>Eligibility Record</CardTitle>
        </CardHeader>

        <CardContent>
          {eligibilityRecords.length > 0 ? (
            <StaggerContainer className="space-y-4">
              {eligibilityRecords.map((record) => {
                const selected = selectedEligibility?.id === record.id;

                return (
                  <StaggerItem key={record.id}>
                    <RecordCardMotion>
                      <button
                        type="button"
                        onClick={() => selectEligibility(record.id)}
                        className={`w-full rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-emerald-500/60 bg-emerald-500/10"
                            : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TicketCheck className="h-5 w-5 text-emerald-400" />
                            <h3 className="font-semibold text-emerald-300">
                              Eligibility Found
                            </h3>
                          </div>

                          <div className="flex gap-2">
                            {record.isDevMock ? (
                              <Badge className="bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/10">
                                DEV MOCK
                              </Badge>
                            ) : null}

                            {record.isDevnetRecord ? (
                              <Badge className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                                REAL DEVNET RECORD
                              </Badge>
                            ) : null}

                            <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">
                              Private Record
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 text-sm">
                          <div>
                            <p className="text-zinc-500">Record ID</p>
                            <p className="font-mono text-zinc-200">
                              {record.id}
                            </p>
                          </div>

                          <div>
                            {record.accountLabel ? (
                              <>
                                <p className="text-zinc-500">Account</p>
                                <p className="font-medium text-zinc-200">
                                  {record.accountLabel}
                                </p>
                              </>
                            ) : null}
                          </div>

                          {record.completedTaskIds ? (
                            <div>
                              <p className="text-zinc-500">
                                Completed Tasks
                              </p>
                              <p className="font-mono text-zinc-200">
                                {record.completedTaskIds.length}
                              </p>
                            </div>
                          ) : null}

                          <div>
                            <p className="text-zinc-500">Owner</p>
                            <p className="break-all font-mono text-zinc-200">
                              {record.owner}
                            </p>
                          </div>

                          {(record.txId ?? issueTxId) ? (
                            <TransactionReveal className="mt-4">
                              <p className="text-zinc-500">
                                Issue transaction ID
                              </p>
                              <p className="break-all font-mono text-emerald-300">
                                {record.txId ?? issueTxId}
                              </p>
                            </TransactionReveal>
                          ) : null}

                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                              <p className="text-zinc-500">Campaign</p>
                              <p className="font-mono text-emerald-300">
                                {record.campaignId}
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                              <p className="text-zinc-500">Tier</p>
                              <p className="font-mono text-emerald-300">
                                {record.tier}
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                              <p className="text-zinc-500">Amount</p>
                              <p className="font-mono text-emerald-300">
                                {record.amount}
                              </p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                              <p className="text-zinc-500">Deadline</p>
                              <p className="font-mono text-emerald-300">
                                {record.deadline}
                              </p>
                            </div>
                          </div>

                          {record.rawRecord ? (
                            <RecordCardMotion className="mt-4 bg-black/40 p-3">
                              <p className="text-zinc-500">
                                {rawEligibilityRecord
                                  ? "Raw Eligibility record"
                                  : "Raw issue_eligibility stdout"}
                              </p>
                              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-200">
                                {record.rawRecord}
                              </pre>
                            </RecordCardMotion>
                          ) : null}
                        </div>
                      </button>
                    </RecordCardMotion>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center">
              <LockKeyhole className="mx-auto h-8 w-8 text-zinc-500" />

              <h3 className="mt-4 font-semibold">No record scanned yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                Current Campaign data is read from the Aleo mapping. Devnet mode
                issues a real Eligibility record through the local Leo CLI.
              </p>

              {ALEO_CONFIG.isDevnet ? (
                <div className="mx-auto mt-4 max-w-sm rounded-xl border border-zinc-800 bg-black/30 p-3 text-left">
                  <p className="text-xs text-zinc-500">Account</p>
                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    {selectedDevnetAccount?.label ?? "No account selected"}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-emerald-300">
                    {selectedDevnetAccount?.address ?? "-"}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-zinc-500">Tasks</p>
                      <p className="font-mono text-xs text-zinc-200">
                        {completedTaskIds.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Tier</p>
                      <p className="font-mono text-xs text-emerald-300">
                        {taskEligibility.tier}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Amount</p>
                      <p className="font-mono text-xs text-emerald-300">
                        {taskEligibility.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <motion.div
                whileHover={!issueDisabled ? { y: -2 } : undefined}
                whileTap={!issueDisabled ? { scale: 0.98 } : undefined}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
              >
                <Button
                  onClick={handleIssueClick}
                  disabled={issueDisabled}
                  className="mt-5 bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  {isScanning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ScanLine className="mr-2 h-4 w-4" />
                  )}
                  {isScanning
                    ? ALEO_CONFIG.isDevnet
                      ? "Issuing Eligibility..."
                      : "Scanning Records..."
                    : ALEO_CONFIG.isDevnet
                      ? "Issue Real Eligibility"
                      : "Scan Eligibility"}
                </Button>
              </motion.div>

              {needsDevnetAccount ? (
                <p className="mt-3 text-center text-xs text-zinc-500">
                  Select a devnet account first.
                </p>
              ) : null}

              {ALEO_CONFIG.isDevnet && accountClaimStatus === "claimed" ? (
                <p className="mt-3 text-center text-xs text-red-400">
                  This account already claimed this campaign. Eligibility
                  issuing is disabled.
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
                  Refresh claim status before issuing eligibility.
                </p>
              ) : null}

              {ALEO_CONFIG.isDevnet &&
              accountClaimStatus === "not_claimed" &&
              !taskEligibility.isEligible ? (
                <p className="mt-3 text-center text-xs text-yellow-200">
                  Complete at least one airdrop task before issuing
                  eligibility.
                </p>
              ) : null}

              {scanError ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-red-400">{scanError}</p>
                  {ALEO_CONFIG.isDevnet ? (
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 26,
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          useMockEligibilityFallback(
                            address ??
                              selectedDevnetAccount?.address ??
                              ALEO_CONFIG.devnetAdminAddress,
                            campaignId,
                          )
                        }
                        className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
                      >
                        Use DEV MOCK fallback
                      </Button>
                    </motion.div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmEligibilityIssueDialog
        open={showIssueDialog}
        completedCount={taskEligibility.completedCount}
        totalTasks={AIRDROP_TASKS.length}
        tier={taskEligibility.tier}
        amount={taskEligibility.amount}
        isMaxTier={taskEligibility.completedCount === AIRDROP_TASKS.length}
        onCancel={() => setShowIssueDialog(false)}
        onConfirm={handleConfirmIssue}
      />
    </AnimatedPanel>
  );
}
