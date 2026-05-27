"use client";

import { useEffect } from "react";
import { Users } from "lucide-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { useAirdropStore } from "@/stores/airdropStore";
import { AnimatedPanel } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function shortAddress(address: string) {
  if (address.length <= 16) {
    return address;
  }

  return `${address.slice(0, 9)}...${address.slice(-5)}`;
}

export function DevnetAccountSwitcher() {
  const {
    devnetAccounts,
    selectedDevnetAccount,
    isLoadingDevnetAccounts,
    devnetAccountError,
    loadDevnetAccounts,
    selectDevnetAccount,
  } = useAirdropStore();

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
