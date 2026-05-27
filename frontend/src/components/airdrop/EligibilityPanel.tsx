"use client";

import { LockKeyhole, Loader2, ScanLine, TicketCheck } from "lucide-react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { useAirdropStore } from "@/stores/airdropStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EligibilityPanel() {
  const walletState = useWallet();
  const { address, connected } = walletState as any;

  const {
    campaignId,
    eligibilityRecords,
    selectedEligibility,
    issueTxId,
    rawEligibilityRecord,
    isScanning,
    scanError,
    scanEligibility,
    useMockEligibilityFallback,
    selectEligibility,
  } = useAirdropStore();

  const handleScan = async () => {
    if (!ALEO_CONFIG.isDevnet && (!connected || !address)) {
      alert("Please connect your Aleo wallet first.");
      return;
    }

    await scanEligibility(address ?? ALEO_CONFIG.devnetAdminAddress, campaignId);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader>
        <CardTitle>Eligibility Record</CardTitle>
      </CardHeader>

      <CardContent>
        {eligibilityRecords.length > 0 ? (
          <div className="space-y-4">
            {eligibilityRecords.map((record) => {
              const selected = selectedEligibility?.id === record.id;

              return (
                <button
                  key={record.id}
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
                      <p className="font-mono text-zinc-200">{record.id}</p>
                    </div>

                    <div>
                      <p className="text-zinc-500">Owner</p>
                      <p className="break-all font-mono text-zinc-200">
                        {record.owner}
                      </p>
                    </div>

                    {record.txId ?? issueTxId ? (
                      <div>
                        <p className="text-zinc-500">Issue transaction ID</p>
                        <p className="break-all font-mono text-emerald-300">
                          {record.txId ?? issueTxId}
                        </p>
                      </div>
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
                      <div className="rounded-xl border border-zinc-800 bg-black/40 p-3">
                        <p className="text-zinc-500">
                          {rawEligibilityRecord
                            ? "Raw Eligibility record"
                            : "Raw issue_eligibility stdout"}
                        </p>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-zinc-200">
                          {record.rawRecord}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center">
            <LockKeyhole className="mx-auto h-8 w-8 text-zinc-500" />

            <h3 className="mt-4 font-semibold">No record scanned yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
              Current Campaign data is read from the Aleo mapping. Devnet mode
              issues a real Eligibility record through the local Leo CLI.
            </p>

            <Button
              onClick={handleScan}
              disabled={isScanning}
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

            {scanError ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-red-400">{scanError}</p>
                {ALEO_CONFIG.isDevnet ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      useMockEligibilityFallback(
                        address ?? ALEO_CONFIG.devnetAdminAddress,
                        campaignId,
                      )
                    }
                    className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
                  >
                    Use DEV MOCK fallback
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
