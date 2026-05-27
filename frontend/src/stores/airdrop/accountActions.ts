import { getTaskEligibility } from "@/constants/airdropTasks";
import { getDevnetAccounts } from "@/services/devnetAccountClient";

import type { AirdropGet, AirdropSet } from "./types";

export function createAccountActions(set: AirdropSet, get: AirdropGet) {
  return {
    loadDevnetAccounts: async () => {
      try {
        set({
          isLoadingDevnetAccounts: true,
          devnetAccountError: null,
        });

        const accounts = await getDevnetAccounts();
        const current = get().selectedDevnetAccount;
        const selected =
          accounts.find((account) => account.id === current?.id) ??
          accounts[0] ??
          null;

        set({
          devnetAccounts: accounts,
          selectedDevnetAccount: selected,
          isLoadingDevnetAccounts: false,
          devnetAccountError:
            accounts.length > 0 ? null : "No local devnet accounts configured.",
        });

        if (selected) {
          await get().loadSelectedAccountClaimStatus(get().campaignId);
          get().loadSelectedAccountTaskProgress();
        }
      } catch (error) {
        set({
          isLoadingDevnetAccounts: false,
          devnetAccountError:
            error instanceof Error
              ? error.message
              : "Failed to load devnet accounts",
        });
      }
    },

    selectDevnetAccount: (accountId: string) => {
      const account = get().devnetAccounts.find(
        (item) => item.id === accountId,
      );

      if (!account) {
        set({
          devnetAccountError: `Unknown devnet account: ${accountId}`,
        });
        return;
      }

      set({
        selectedDevnetAccount: account,
        devnetAccountError: null,
        eligibilityRecords: [],
        selectedEligibility: null,
        rawEligibilityRecord: null,
        rawRewardRecord: null,
        issueTxId: null,
        claimTxId: null,
        scanError: null,
        claimError: null,
        claimErrorDetails: null,
        claimStatus: "idle",
        accountClaimStatus: "checking",
        accountClaimKey: null,
        accountClaimStatusError: null,
        completedTaskIds: [],
        taskEligibility: getTaskEligibility([]),
        taskProgressError: null,
        lastCompletedTaskId: null,
        lastCompletedTaskTitle: null,
        lastRewardAnimation: null,
      });

      void get().loadSelectedAccountClaimStatus(get().campaignId);
      get().loadSelectedAccountTaskProgress();
    },
  };
}
