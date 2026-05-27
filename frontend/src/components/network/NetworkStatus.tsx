"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCcw, WifiOff } from "lucide-react";

import { ALEO_CONFIG } from "@/config/aleo";
import { getLatestBlockHeight } from "@/services/aleoRestClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedPanel, StatusPulse } from "@/components/motion";
import { motion } from "framer-motion";

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
    <AnimatedPanel delay={0.2}>
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Aleo Network</CardTitle>

          <StatusPulse
            label={isReady ? "Ready" : status}
            tone={isReady ? "green" : status === "loading" ? "yellow" : "red"}
          />
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
              <p className="text-sm text-zinc-400">{connectionLabel}</p>
              <p className="mt-1 font-mono text-sm text-emerald-300">
                Latest block height: {latestHeight || "-"}
              </p>
            </div>

            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="inline-flex"
            >
              <Button
                size="icon"
                variant="outline"
                onClick={loadNetworkStatus}
                className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-red-400">{errorMessage}</p>
          ) : null}
        </CardContent>
      </Card>
    </AnimatedPanel>
  );
}
