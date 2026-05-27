import { ALEO_CONFIG } from "@/config/aleo";
import { getDevnetClaimStatus } from "@/services/devnetClaimStatusClient";

import type { AirdropGet, AirdropSet } from "./types";

export function createClaimStatusActions(set: AirdropSet, get: AirdropGet) {
  return {
    loadSelectedAccountClaimStatus: async (campaignId = get().campaignId) => {
      if (!ALEO_CONFIG.isDevnet) {
        set({
          accountClaimStatus: "unknown",
          accountClaimKey: null,
          accountClaimStatusError: null,
          isCheckingAccountClaimStatus: false,
        });
        return;
      }

      const selectedDevnetAccount = get().selectedDevnetAccount;

      if (!selectedDevnetAccount) {
        set({
          accountClaimStatus: "unknown",
          accountClaimKey: null,
          accountClaimStatusError: null,
          isCheckingAccountClaimStatus: false,
        });
        return;
      }

      try {
        set({
          accountClaimStatus: "checking",
          accountClaimStatusError: null,
          isCheckingAccountClaimStatus: true,
        });

        const result = await getDevnetClaimStatus({
          accountId: selectedDevnetAccount.id,
          campaignId,
        });

        if (get().selectedDevnetAccount?.id !== selectedDevnetAccount.id) {
          return;
        }

        set({
          accountClaimStatus: result.claimed ? "claimed" : "not_claimed",
          accountClaimKey: result.claimKey,
          accountClaimStatusError: null,
          isCheckingAccountClaimStatus: false,
        });
      } catch (error) {
        set({
          accountClaimStatus: "error",
          accountClaimKey: null,
          accountClaimStatusError:
            error instanceof Error
              ? error.message
              : "Failed to load account claim status",
          isCheckingAccountClaimStatus: false,
        });
      }
    },
  };
}
