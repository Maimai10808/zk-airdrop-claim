"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCcw, WifiOff } from "lucide-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { getLatestBlockHeight } from "@/services/aleoRestClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NetworkStatus() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [latestHeight, setLatestHeight] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadNetworkStatus = async () => {
    try {
      setStatus("loading");
      setErrorMessage("");

      const height = await getLatestBlockHeight();

      setLatestHeight(height);
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown network error",
      );
    }
  };

  useEffect(() => {
    loadNetworkStatus();
  }, []);

  const isReady = status === "ready";
  const connectionLabel = ALEO_CONFIG.isDevnet
    ? "Connected to local devnet"
    : `Connected to ${ALEO_CONFIG.network}`;

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Aleo Network</CardTitle>

        <Badge
          className={
            isReady
              ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
              : "bg-zinc-800 text-zinc-300"
          }
        >
          {isReady ? "Ready" : status}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          {isReady ? (
            <Activity className="h-5 w-5 text-emerald-400" />
          ) : (
            <WifiOff className="h-5 w-5 text-zinc-500" />
          )}

          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-200">
              Status: {isReady ? "Ready" : status}
            </p>
            <p className="text-sm text-zinc-400">
              {connectionLabel}
            </p>
            <p className="mt-1 font-mono text-sm text-emerald-300">
              Latest block height: {latestHeight || "-"}
            </p>
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={loadNetworkStatus}
            className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
