"use client";

import { LogOut, Wallet } from "lucide-react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletNotSelectedError } from "@provablehq/aleo-wallet-adaptor-core";
import { ALEO_CONFIG } from "@/config/aleo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedPanel, StatusPulse } from "@/components/motion";
import { motion } from "framer-motion";

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

      await connect(ALEO_CONFIG.walletNetwork as any);
    } catch (error) {
      console.error("[wallet] failed to connect:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to connect Aleo wallet",
      );
    }
  };

  if (ALEO_CONFIG.isDevnet) {
    return (
      <AnimatedPanel delay={0.1}>
        <Card className="border-zinc-800 bg-zinc-950 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-emerald-400" />
              Wallet
            </CardTitle>

            <StatusPulse label="Local Devnet" tone="yellow" />
          </CardHeader>

          <CardContent>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-sm text-zinc-400">
                Local devnet mode is enabled. Use{" "}
                <span className="font-mono text-emerald-300">leo execute</span>{" "}
                for local transactions. The frontend reads mappings from{" "}
                <span className="font-mono text-emerald-300">
                  localhost:3030
                </span>
                .
              </p>

              <p className="mt-4 text-sm text-zinc-500">Devnet Admin</p>
              <p className="mt-1 break-all font-mono text-sm text-emerald-300">
                {ALEO_CONFIG.devnetAdminAddress}
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedPanel>
    );
  }

  return (
    <AnimatedPanel delay={0.1}>
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Wallet
          </CardTitle>

          <StatusPulse
            label={
              connecting
                ? "Connecting"
                : connected
                  ? "Connected"
                  : "Disconnected"
            }
            tone={connected ? "green" : connecting ? "yellow" : "red"}
          />
        </CardHeader>

        <CardContent className="space-y-4">
          <motion.div
            className="w-full"
            whileHover={connecting || connected ? undefined : { y: -2 }}
            whileTap={connecting || connected ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
          >
            <Button
              type="button"
              onClick={handleConnect}
              disabled={connecting || connected}
              className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
            >
              {connecting
                ? "Connecting..."
                : connected
                  ? "Connected"
                  : "Connect Wallet"}
            </Button>
          </motion.div>

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
              <motion.div
                className="w-full"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => disconnect()}
                  className="mt-4 border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </motion.div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </AnimatedPanel>
  );
}
