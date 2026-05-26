import { ALEO_CONFIG } from "@/config/aleo";

export type CampaignState = {
  enabled: boolean;
  deadline: string;
  totalClaimedUsers: string;
  totalClaimedAmount: string;
};

export async function getLatestBlockHeight() {
  const response = await fetch(
    `${ALEO_CONFIG.apiBaseUrl}/${ALEO_CONFIG.network}/block/height/latest`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch latest Aleo block height");
  }

  return response.text();
}

export async function getProgramMappingValue(
  programId: string,
  mappingName: string,
  key: string,
) {
  const response = await fetch(
    `${ALEO_CONFIG.apiBaseUrl}/${ALEO_CONFIG.network}/program/${programId}/mapping/${mappingName}/${key}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.text();
}

export async function getTransaction(txId: string) {
  const response = await fetch(
    `${ALEO_CONFIG.apiBaseUrl}/${ALEO_CONFIG.network}/transaction/${txId}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function waitForTransaction(
  txId: string,
  options?: {
    retries?: number;
    delayMs?: number;
  },
) {
  const retries = options?.retries ?? 20;
  const delayMs = options?.delayMs ?? 3000;

  for (let index = 0; index < retries; index += 1) {
    const transaction = await getTransaction(txId);

    if (transaction) {
      return transaction;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Transaction confirmation timeout");
}

export async function getCampaign(campaignId: string) {
  const raw = await getProgramMappingValue(
    ALEO_CONFIG.programId,
    ALEO_CONFIG.mappings.campaigns,
    campaignId,
  );

  if (!raw) {
    return null;
  }

  return parseCampaign(raw);
}

export async function getClaimedStatus(claimKey: string) {
  const raw = await getProgramMappingValue(
    ALEO_CONFIG.programId,
    ALEO_CONFIG.mappings.claimed,
    claimKey,
  );

  return raw?.includes("true") ?? false;
}

export function parseCampaign(raw: string): CampaignState {
  const enabled = raw.includes("enabled: true");

  const deadline =
    raw.match(/deadline:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/deadline:\s*([0-9]+)/)?.[1] ??
    "-";

  const totalClaimedUsers =
    raw.match(/total_claimed_users:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/totalClaimedUsers:\s*([0-9]+u64)/)?.[1] ??
    "0u64";

  const totalClaimedAmount =
    raw.match(/total_claimed_amount:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/totalClaimedAmount:\s*([0-9]+u64)/)?.[1] ??
    "0u64";

  return {
    enabled,
    deadline,
    totalClaimedUsers,
    totalClaimedAmount,
  };
}
