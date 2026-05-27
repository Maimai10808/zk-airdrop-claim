import { ALEO_CONFIG } from "@/config/aleo";

export type CampaignState = {
  enabled: boolean;
  deadline: string;
  totalClaimedUsers: string;
  totalClaimedAmount: string;
};

/**
 * 拼接 Aleo REST API 地址。
 *
 * 本地 devnet:
 *   http://localhost:3030/testnet/...
 *
 * Provable public API:
 *   https://api.provable.com/v2/testnet/...
 */
export function buildAleoUrl(path: string) {
  const baseUrl = ALEO_CONFIG.apiBaseUrl.replace(/\/$/, "");
  const network = ALEO_CONFIG.network.replace(/^\//, "").replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");

  return `${baseUrl}/${network}/${cleanPath}`;
}

/**
 * 获取最新区块高度。
 *
 * Leo devnet does not support /block/height/latest, so the UI shows a stable
 * local devnet marker while mapping reads continue to use the real endpoint.
 */
export async function getLatestBlockHeight() {
  if (ALEO_CONFIG.isDevnet) {
    return "local-devnet";
  }

  const response = await fetch(buildAleoUrl("/block/height/latest"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch latest Aleo block height");
  }

  return response.text();
}

/**
 * 读取 program mapping。
 *
 * 示例：
 * http://localhost:3030/testnet/program/zk_airdrop_claim.aleo/mapping/campaigns/1u64
 */
export async function getProgramMappingValue(
  programId: string,
  mappingName: string,
  key: string,
) {
  const response = await fetch(
    buildAleoUrl(`/program/${programId}/mapping/${mappingName}/${key}`),
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
  const response = await fetch(buildAleoUrl(`/transaction/${txId}`), {
    cache: "no-store",
  });

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
  const enabled = /enabled:\s*true/.test(raw);

  const deadline =
    raw.match(/deadline:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/deadline:\s*([0-9]+)/)?.[1] ??
    "-";

  const totalClaimedUsers =
    raw.match(/total_claimed_users:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/totalClaimedUsers:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/total_claimed_users:\s*([0-9]+)/)?.[1] ??
    "0u64";

  const totalClaimedAmount =
    raw.match(/total_claimed_amount:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/totalClaimedAmount:\s*([0-9]+u64)/)?.[1] ??
    raw.match(/total_claimed_amount:\s*([0-9]+)/)?.[1] ??
    "0u64";

  return {
    enabled,
    deadline,
    totalClaimedUsers,
    totalClaimedAmount,
  };
}
