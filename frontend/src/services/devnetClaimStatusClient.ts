import type { PublicDevnetAccount } from "@/types/devnetAccount";

type DevnetClaimStatusResponse = {
  ok: boolean;
  account?: PublicDevnetAccount;
  campaignId?: string;
  claimKey?: string;
  claimed?: boolean;
  error?: string;
};

export async function getDevnetClaimStatus(params: {
  accountId: string;
  campaignId: string;
}): Promise<{
  account: PublicDevnetAccount;
  campaignId: string;
  claimKey: string;
  claimed: boolean;
}> {
  const response = await fetch("/api/devnet/claim-status", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const data = (await response.json()) as DevnetClaimStatusResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "Failed to load account claim status");
  }

  if (!data.account || !data.campaignId || !data.claimKey) {
    throw new Error("Invalid account claim status response");
  }

  return {
    account: data.account,
    campaignId: data.campaignId,
    claimKey: data.claimKey,
    claimed: Boolean(data.claimed),
  };
}
