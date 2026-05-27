import type { PublicDevnetAccount } from "@/types/devnetAccount";

type DevnetAccountsResponse = {
  ok: boolean;
  accounts?: PublicDevnetAccount[];
  error?: string;
};

export async function getDevnetAccounts(): Promise<PublicDevnetAccount[]> {
  const response = await fetch("/api/devnet/accounts");
  const data = (await response.json()) as DevnetAccountsResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.error ?? "Failed to load devnet accounts");
  }

  return data.accounts ?? [];
}
