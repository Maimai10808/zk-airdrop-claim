"use client";

import { useEffect } from "react";
import { CalendarClock, RefreshCcw, UsersRound, WalletCards } from "lucide-react";

import { useAirdropStore } from "@/stores/airdropStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CampaignPanel() {
  const {
    campaign,
    campaignId,
    campaignNotFound,
    isLoadingCampaign,
    campaignError,
    loadCampaign,
  } = useAirdropStore();

  useEffect(() => {
    loadCampaign(campaignId);
  }, [campaignId, loadCampaign]);

  const campaignStatusLabel = isLoadingCampaign
    ? "Loading"
    : campaignNotFound
      ? "Not Found"
      : campaign?.enabled
        ? "Enabled"
        : campaign
          ? "Disabled"
          : "Unknown";

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Campaign</CardTitle>

        <div className="flex items-center gap-2">
          <Badge
            className={
              isLoadingCampaign || campaignNotFound || !campaign
                ? "bg-zinc-800 text-zinc-300"
                : campaign?.enabled
                ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
                : "bg-red-500/10 text-red-300 hover:bg-red-500/10"
            }
          >
            {campaignStatusLabel}
          </Badge>

          <Button
            size="icon"
            variant="outline"
            onClick={() => loadCampaign(campaignId)}
            className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm text-zinc-500">Campaign ID</p>
          <p className="mt-1 font-mono text-lg">{campaignId}</p>
        </div>

        {campaignError ? (
          <p className="text-sm text-red-400">{campaignError}</p>
        ) : null}

        {campaignNotFound ? (
          <p className="text-sm text-zinc-400">
            Campaign mapping was not found for this ID.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <CalendarClock className="h-5 w-5 text-emerald-400" />
            <p className="mt-3 text-sm text-zinc-500">Deadline</p>
            <p className="mt-1 font-mono">
              {isLoadingCampaign ? "Loading..." : campaign?.deadline ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <UsersRound className="h-5 w-5 text-emerald-400" />
            <p className="mt-3 text-sm text-zinc-500">Claimed Users</p>
            <p className="mt-1 font-mono">
              {isLoadingCampaign
                ? "Loading..."
                : campaign?.totalClaimedUsers ?? "0u64"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <WalletCards className="h-5 w-5 text-emerald-400" />
            <p className="mt-3 text-sm text-zinc-500">Claimed Amount</p>
            <p className="mt-1 font-mono">
              {isLoadingCampaign
                ? "Loading..."
                : campaign?.totalClaimedAmount ?? "0u64"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
