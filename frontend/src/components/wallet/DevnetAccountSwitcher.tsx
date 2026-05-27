"use client";

import { useEffect } from "react";
import { RefreshCcw, Users } from "lucide-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { useAirdropStore } from "@/stores/airdropStore";
import { AnimatedPanel, StatusPulse } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function shortAddress(address: string) {
  if (address.length <= 16) {
    return address;
  }

  return `${address.slice(0, 9)}...${address.slice(-5)}`;
}

function getClaimStatusView(status: string) {
  switch (status) {
    case "checking":
      return { label: "Checking claim status...", tone: "blue" as const };
    case "not_claimed":
      return { label: "Not Claimed", tone: "green" as const };
    case "claimed":
      return { label: "Already Claimed", tone: "red" as const };
    case "error":
      return { label: "Status Error", tone: "red" as const };
    default:
      return { label: "Unknown", tone: "zinc" as const };
  }
}

export function DevnetAccountSwitcher() {
  const {
    devnetAccounts,
    selectedDevnetAccount,
    isLoadingDevnetAccounts,
    devnetAccountError,
    accountClaimStatus,
    accountClaimKey,
    accountClaimStatusError,
    loadDevnetAccounts,
    loadSelectedAccountClaimStatus,
    selectDevnetAccount,
    campaignId,
  } = useAirdropStore();

  const claimStatusView = getClaimStatusView(accountClaimStatus);

  useEffect(() => {
    if (ALEO_CONFIG.isDevnet) {
      void loadDevnetAccounts();
    }
  }, [loadDevnetAccounts]);

  if (!ALEO_CONFIG.isDevnet) {
    return null;
  }

  return (
    <AnimatedPanel delay={0.15}>
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-emerald-400" />
            Devnet Accounts
          </CardTitle>

          <Badge className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
            {selectedDevnetAccount?.label ?? "No account"}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-sm text-zinc-500">Selected Account</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">
              {selectedDevnetAccount?.label ?? "Loading accounts..."}
            </p>

            <p className="mt-3 text-sm text-zinc-500">Address</p>
            <p className="mt-1 break-all font-mono text-xs text-emerald-300">
              {selectedDevnetAccount?.address ?? "-"}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <StatusPulse
                label={claimStatusView.label}
                tone={claimStatusView.tone}
              />

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => loadSelectedAccountClaimStatus(campaignId)}
                className="border-zinc-700 bg-transparent text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white"
              >
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Refresh Claim Status
              </Button>
            </div>

            {accountClaimStatus === "claimed" ? (
              <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
                This account has already claimed campaign {campaignId}.
              </p>
            ) : null}

            {accountClaimStatusError ? (
              <p className="mt-3 text-xs text-red-400">
                {accountClaimStatusError}
              </p>
            ) : null}

            {accountClaimKey ? (
              <details className="mt-3 rounded-xl border border-zinc-800 bg-black/30 p-3">
                <summary className="cursor-pointer text-xs text-zinc-500">
                  Claim Key
                </summary>
                <p className="mt-2 break-all font-mono text-[11px] leading-5 text-zinc-400">
                  {accountClaimKey}
                </p>
              </details>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {devnetAccounts.map((account) => {
              const selected = selectedDevnetAccount?.id === account.id;

              return (
                <Button
                  key={account.id}
                  type="button"
                  variant="outline"
                  onClick={() => selectDevnetAccount(account.id)}
                  className={`h-auto flex-col items-start gap-1 border-zinc-800 bg-zinc-900/60 p-3 text-left hover:bg-zinc-800 ${
                    selected
                      ? "border-emerald-500/60 text-emerald-300"
                      : "text-zinc-300"
                  }`}
                >
                  <span className="text-sm font-medium">{account.label}</span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {shortAddress(account.address)}
                  </span>
                </Button>
              );
            })}
          </div>

          {isLoadingDevnetAccounts ? (
            <p className="text-xs text-zinc-500">Loading devnet accounts...</p>
          ) : null}

          {devnetAccountError ? (
            <p className="text-xs text-red-400">{devnetAccountError}</p>
          ) : null}
        </CardContent>
      </Card>
    </AnimatedPanel>
  );
}
