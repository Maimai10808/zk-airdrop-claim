import { ALEO_CONFIG } from "@/config/aleo";
import {
  AIRDROP_MESSAGES,
  DEFAULT_CAMPAIGN_ID,
  DEFAULT_ELIGIBILITY_DEADLINE,
  MOCK_SCAN_DELAY_MS,
} from "@/constants/airdrop";
import { issueEligibilityDevnet } from "@/services/devnetAirdropClient";

import { ACCOUNT_ALREADY_CLAIMED_ISSUE_MESSAGE } from "./messages";
import {
  createDevnetEligibilityRecord,
  createMockEligibilityRecord,
  sleep,
} from "./recordFactories";
import type { AirdropGet, AirdropSet } from "./types";

export function createEligibilityActions(set: AirdropSet, get: AirdropGet) {
  return {
    /**
     * 扫描或签发 Eligibility record。
     *
     * 本地 devnet 模式：
     * - 调用 Next.js API route；
     * - 服务端执行 `leo execute issue_eligibility`；
     * - 返回真实 Eligibility record。
     *
     * mock 模式：
     * - 只创建前端本地假 record；
     * - 不会广播交易。
     */
    scanEligibility: async (
      address: string,
      campaignId = DEFAULT_CAMPAIGN_ID,
    ) => {
      try {
        set({
          isScanning: true,
          scanError: null,
          eligibilityRecords: [],
          selectedEligibility: null,
          issueTxId: null,
          claimTxId: null,
          rawEligibilityRecord: null,
          rawRewardRecord: null,
          claimStatus: "idle",
          claimError: null,
          claimErrorDetails: null,
        });

        console.log("[airdrop] scan start", { address, campaignId });

        if (ALEO_CONFIG.isDevnet) {
          const selectedDevnetAccount = get().selectedDevnetAccount;

          if (!selectedDevnetAccount) {
            throw new Error("Select a devnet account first.");
          }

          const accountClaimStatus = get().accountClaimStatus;

          if (accountClaimStatus === "claimed") {
            throw new Error(ACCOUNT_ALREADY_CLAIMED_ISSUE_MESSAGE);
          }

          if (accountClaimStatus === "checking") {
            throw new Error(
              "Checking claim status. Please wait before issuing eligibility.",
            );
          }

          if (
            accountClaimStatus === "unknown" ||
            accountClaimStatus === "error"
          ) {
            throw new Error("Refresh claim status before issuing eligibility.");
          }

          const taskEligibility = get().taskEligibility;
          const completedTaskIds = get().completedTaskIds;

          if (!taskEligibility.isEligible) {
            throw new Error(
              "Complete at least one airdrop task before issuing eligibility.",
            );
          }

          const result = await issueEligibilityDevnet({
            accountId: selectedDevnetAccount.id,
            campaignId,
            tier: taskEligibility.tier,
            amount: taskEligibility.amount,
            deadline: DEFAULT_ELIGIBILITY_DEADLINE,
          });

          if (!result.ok) {
            throw new Error(
              result.error ?? AIRDROP_MESSAGES.issueEligibilityFailed,
            );
          }

          const rawRecord = result.eligibilityRecord ?? result.stdout ?? "";

          if (!rawRecord) {
            throw new Error(AIRDROP_MESSAGES.eligibilityRecordParsingFailed);
          }

          const record = createDevnetEligibilityRecord({
            owner: selectedDevnetAccount.address,
            accountId: selectedDevnetAccount.id,
            accountLabel: selectedDevnetAccount.label,
            txId: result.txId ?? null,
            rawRecord,
            campaignId,
            tier: taskEligibility.tier,
            amount: taskEligibility.amount,
            completedTaskIds,
          });

          set({
            executionMode: "devnet",
            isScanning: false,
            eligibilityRecords: [record],
            selectedEligibility: record,
            issueTxId: result.txId ?? null,
            rawEligibilityRecord: rawRecord,
            scanError: result.eligibilityRecord
              ? null
              : AIRDROP_MESSAGES.eligibilityRecordParsingFailed,
          });

          return;
        }

        await sleep(MOCK_SCAN_DELAY_MS);

        const record = createMockEligibilityRecord(address, campaignId);

        console.log("[airdrop] records found", [record]);

        set({
          executionMode: "mock",
          isScanning: false,
          eligibilityRecords: [record],
          selectedEligibility: record,
        });
      } catch (error) {
        set({
          isScanning: false,
          scanError:
            error instanceof Error
              ? error.message
              : AIRDROP_MESSAGES.scanFailed,
        });
      }
    },

    /**
     * 手动切回 mock fallback。
     *
     * 当本地 devnet 不可用或真实执行失败时，
     * 用户仍然可以通过 mock flow 查看 UI 流程。
     */
    useMockEligibilityFallback: (
      address: string,
      campaignId = DEFAULT_CAMPAIGN_ID,
    ) => {
      const record = createMockEligibilityRecord(address, campaignId);

      set({
        executionMode: "mock",
        scanError: null,
        claimError: null,
        claimErrorDetails: null,
        eligibilityRecords: [record],
        selectedEligibility: record,
        rawEligibilityRecord: null,
        rawRewardRecord: null,
        issueTxId: null,
        claimTxId: null,
      });
    },

    /**
     * 根据前端本地 id 选择 Eligibility record。
     */
    selectEligibility: (recordId: string) => {
      const record = get().eligibilityRecords.find(
        (item) => item.id === recordId,
      );

      set({
        selectedEligibility: record ?? null,
      });
    },
  };
}
