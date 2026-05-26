"use client";

import { LogOut, Wallet } from "lucide-react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletNotSelectedError } from "@provablehq/aleo-wallet-adaptor-core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WalletPanel() {
  const walletState = useWallet();

  const {
    wallets,
    wallet,
    address,
    connected,
    connecting,
    selectWallet,
    connect,
    disconnect,
  } = walletState as any;

  const handleConnect = async () => {
    try {
      console.log("[wallet] wallets:", wallets);
      console.log("[wallet] selected:", wallet);

      if (!wallet) {
        const firstWallet = wallets?.[0];

        if (!firstWallet) {
          throw new WalletNotSelectedError();
        }

        selectWallet(firstWallet.adapter.name);
      }

      await connect("testnet3" as any);
    } catch (error) {
      console.error("[wallet] failed to connect:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to connect Aleo wallet",
      );
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-emerald-400" />
          Wallet
        </CardTitle>

        <Badge
          className={
            connected
              ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
              : "bg-zinc-800 text-zinc-300"
          }
        >
          {connecting ? "Connecting" : connected ? "Connected" : "Disconnected"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button
          type="button"
          onClick={handleConnect}
          disabled={connecting || connected}
          className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
        >
          {connecting ? "Connecting..." : connected ? "Connected" : "Connect Wallet"}
        </Button>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm text-zinc-500">Available Wallets</p>
          <p className="mt-1 text-sm font-medium">
            {wallets?.length > 0
              ? wallets.map((item: any) => item.adapter.name).join(", ")
              : "No wallet adapter found"}
          </p>

          <p className="mt-4 text-sm text-zinc-500">Selected Wallet</p>
          <p className="mt-1 text-sm font-medium">
            {wallet?.adapter?.name ?? "No wallet selected"}
          </p>

          <p className="mt-4 text-sm text-zinc-500">Address</p>
          <p className="mt-1 break-all font-mono text-sm text-emerald-300">
            {address ?? "Not connected"}
          </p>

          {connected ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => disconnect()}
              className="mt-4 border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
