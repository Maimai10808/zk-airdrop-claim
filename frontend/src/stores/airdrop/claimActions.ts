import { ALEO_CONFIG } from "@/config/aleo";
import {
  AIRDROP_MESSAGES,
  DEFAULT_CLAIM_CURRENT_TIME,
  MOCK_CONFIRM_DELAY_MS,
  MOCK_PREPARE_DELAY_MS,
  MOCK_TX_ID_PREFIX,
  MOCK_WALLET_DELAY_MS,
} from "@/constants/airdrop";
import { claimAirdropDevnet } from "@/services/devnetAirdropClient";

import { getDevnetErrorDetails } from "./errorHelpers";
import { ACCOUNT_ALREADY_CLAIMED_MESSAGE } from "./messages";
import {
  createDevnetRewardRecord,
  createMockRewardRecord,
  sleep,
} from "./recordFactories";
import type { AirdropGet, AirdropSet } from "./types";

export function createClaimActions(set: AirdropSet, get: AirdropGet) {
  return {
    /**
     * 领取当前选中的 Eligibility record。
     *
     * 本地 devnet 模式：
     * - 调用 Next.js API route；
     * - 服务端执行 `leo execute claim_airdrop`；
     * - 成功后获得真实 Reward record；
     * - 再刷新 campaign mapping。
     *
     * mock 模式：
     * - 只模拟提交和确认；
     * - 生成前端本地 mock Reward record；
     * - 不会改变链上 mapping。
     */
    claimSelectedEligibility: async () => {
      const { selectedEligibility } = get();

      if (!selectedEligibility) {
        set({
          claimError: AIRDROP_MESSAGES.selectEligibilityFirst,
          claimStatus: "failed",
        });
        return;
      }

      try {
        console.log("[airdrop] claim start", selectedEligibility);

        set({
          isClaiming: true,
          claimStatus: "preparing",
          claimError: null,
          claimErrorDetails: null,
          lastTxId: null,
        });

        if (ALEO_CONFIG.isDevnet && !selectedEligibility.isDevMock) {
          const selectedDevnetAccount = get().selectedDevnetAccount;

          if (!selectedDevnetAccount) {
            throw new Error("Select a devnet account first.");
          }

          if (selectedEligibility.owner !== selectedDevnetAccount.address) {
            throw new Error(
              "This Eligibility record belongs to another selected account. Switch back or issue a new record.",
            );
          }

          if (get().accountClaimStatus === "claimed") {
            throw new Error(ACCOUNT_ALREADY_CLAIMED_MESSAGE);
          }

          if (get().accountClaimStatus === "checking") {
            throw new Error(
              "Checking claim status. Please wait before claiming.",
            );
          }

          if (
            get().accountClaimStatus === "unknown" ||
            get().accountClaimStatus === "error"
          ) {
            throw new Error("Refresh claim status before claiming.");
          }

          const rawEligibilityRecord =
            selectedEligibility.rawRecord ?? get().rawEligibilityRecord;

          if (!rawEligibilityRecord) {
            throw new Error(AIRDROP_MESSAGES.eligibilityRecordParsingFailed);
          }

          const result = await claimAirdropDevnet({
            accountId: selectedDevnetAccount.id,
            campaignId: selectedEligibility.campaignId,
            eligibilityRecord: rawEligibilityRecord,
            currentTime: DEFAULT_CLAIM_CURRENT_TIME,
          });

          if (!result.ok) {
            throw new Error(
              result.error ?? AIRDROP_MESSAGES.claimAirdropFailed,
            );
          }

          const rawRewardRecord = result.rewardRecord ?? result.stdout ?? "";

          if (!rawRewardRecord) {
            throw new Error(AIRDROP_MESSAGES.rewardRecordParsingFailed);
          }

          const reward = createDevnetRewardRecord({
            owner: selectedDevnetAccount.address,
            accountId: selectedDevnetAccount.id,
            accountLabel: selectedDevnetAccount.label,
            campaignId: selectedEligibility.campaignId,
            amount: selectedEligibility.amount,
            txId: result.txId ?? null,
            rawRecord: rawRewardRecord,
            completedTaskIds: selectedEligibility.completedTaskIds,
            eligibilityTier: selectedEligibility.eligibilityTier,
          });

          set((state) => ({
            executionMode: "devnet",
            rewards: [reward, ...state.rewards],
            selectedEligibility: null,
            eligibilityRecords: state.eligibilityRecords.filter(
              (item) => item.id !== selectedEligibility.id,
            ),
            isClaiming: false,
            claimStatus: "confirmed",
            lastTxId: result.txId ?? null,
            claimTxId: result.txId ?? null,
            rawRewardRecord,
            claimError: result.rewardRecord
              ? null
              : AIRDROP_MESSAGES.rewardRecordParsingFailed,
          }));

          /**
           * claim_airdrop 的 finalize 会更新 campaign mapping：
           * - total_claimed_users
           * - total_claimed_amount
           *
           * 所以真实 claim 成功后，需要重新读取 campaign。
           */
          await get().loadCampaign(selectedEligibility.campaignId);
          await get().loadSelectedAccountClaimStatus(
            selectedEligibility.campaignId,
          );
          return;
        }

        /**
         * mock fallback 流程。
         *
         * 这里不会执行任何 Aleo 交易，只是模拟：
         * - 准备交易；
         * - 等待钱包确认；
         * - 提交交易；
         * - 等待确认。
         */
        await sleep(MOCK_PREPARE_DELAY_MS);

        set({
          claimStatus: "waiting_wallet",
        });

        await sleep(MOCK_WALLET_DELAY_MS);

        const mockTxId = `${MOCK_TX_ID_PREFIX}_${Date.now()}`;

        set({
          claimStatus: "submitted",
          lastTxId: mockTxId,
        });

        console.log("[airdrop] tx submitted", mockTxId);

        await sleep(MOCK_CONFIRM_DELAY_MS);

        const reward = createMockRewardRecord({
          owner: selectedEligibility.owner,
          accountId: selectedEligibility.accountId,
          accountLabel: selectedEligibility.accountLabel,
          campaignId: selectedEligibility.campaignId,
          amount: selectedEligibility.amount,
          txId: mockTxId,
          completedTaskIds: selectedEligibility.completedTaskIds,
          eligibilityTier: selectedEligibility.eligibilityTier,
        });

        console.log("[airdrop] tx confirmed", reward);

        set((state) => ({
          executionMode: "mock",
          rewards: [reward, ...state.rewards],
          selectedEligibility: null,
          eligibilityRecords: state.eligibilityRecords.filter(
            (item) => item.id !== selectedEligibility.id,
          ),
          isClaiming: false,
          claimStatus: "confirmed",
        }));
      } catch (error) {
        console.error("[airdrop] claim failed", error);

        set({
          isClaiming: false,
          claimStatus: "failed",
          claimError:
            error instanceof Error
              ? error.message
              : AIRDROP_MESSAGES.claimFailed,
          claimErrorDetails: getDevnetErrorDetails(error),
        });

        if (ALEO_CONFIG.isDevnet) {
          await get().loadSelectedAccountClaimStatus(
            selectedEligibility.campaignId,
          );
        }
      }
    },

    /**
     * 预留的真实 claim 入口。
     *
     * 目前内部直接复用 claimSelectedEligibility。
     * 后续如果接入钱包签名或公共 testnet，可以在这里扩展。
     */
    executeClaimAirdrop: async () => {
      await get().claimSelectedEligibility();
    },

    /**
     * 重置 claim 相关状态。
     */
    resetClaimState: () => {
      set({
        claimStatus: "idle",
        claimError: null,
        claimErrorDetails: null,
        lastTxId: null,
      });
    },
  };
}
