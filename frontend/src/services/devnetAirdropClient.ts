import type { PublicDevnetAccount } from "@/types/devnetAccount";

export type DevnetIssueEligibilityParams = {
  accountId: string;
  campaignId: string;
  tier: string;
  amount: string;
  deadline: string;
};

export type DevnetClaimAirdropParams = {
  accountId: string;
  campaignId?: string;
  eligibilityRecord: string;
  currentTime: string;
};

export type DevnetIssueEligibilityResponse = {
  ok: boolean;
  account?: PublicDevnetAccount;
  txId?: string | null;
  eligibilityRecord?: string | null;
  stdout?: string;
  stderr?: string;
  error?: string;
};

export type DevnetClaimAirdropResponse = {
  ok: boolean;
  account?: PublicDevnetAccount;
  txId?: string | null;
  rewardRecord?: string | null;
  stdout?: string;
  stderr?: string;
  error?: string;
};

export class DevnetApiError extends Error {
  stdout: string;
  stderr: string;

  constructor(message: string, stdout = "", stderr = "") {
    super(message);
    this.name = "DevnetApiError";
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

export function isDevnetApiError(error: unknown): error is DevnetApiError {
  return error instanceof DevnetApiError;
}

async function parseDevnetResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & {
    error?: string;
    stdout?: string;
    stderr?: string;
  };

  if (!response.ok) {
    throw new DevnetApiError(
      data.error ?? "Devnet API request failed",
      data.stdout,
      data.stderr,
    );
  }

  return data;
}

export async function issueEligibilityDevnet(
  params: DevnetIssueEligibilityParams,
) {
  const response = await fetch("/api/devnet/issue-eligibility", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return parseDevnetResponse<DevnetIssueEligibilityResponse>(response);
}

export async function claimAirdropDevnet(params: DevnetClaimAirdropParams) {
  const response = await fetch("/api/devnet/claim-airdrop", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return parseDevnetResponse<DevnetClaimAirdropResponse>(response);
}
