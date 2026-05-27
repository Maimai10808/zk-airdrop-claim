import { create } from "zustand";

import { ALEO_CONFIG } from "@/config/aleo";
import {
  AIRDROP_MESSAGES,
  DEFAULT_CAMPAIGN_ID,
  DEFAULT_CLAIM_CURRENT_TIME,
  DEFAULT_ELIGIBILITY_AMOUNT,
  DEFAULT_ELIGIBILITY_DEADLINE,
  DEFAULT_ELIGIBILITY_TIER,
  ELIGIBILITY_RECORD_ID_PREFIX,
  MOCK_CONFIRM_DELAY_MS,
  MOCK_PREPARE_DELAY_MS,
  MOCK_SCAN_DELAY_MS,
  MOCK_TX_ID_PREFIX,
  MOCK_WALLET_DELAY_MS,
  REWARD_RECORD_ID_PREFIX,
  buildMockEligibilityPlaintext,
  createLocalRecordId,
} from "@/constants/airdrop";
import { getCampaign } from "@/services/aleoRestClient";
import {
  claimAirdropDevnet,
  issueEligibilityDevnet,
  isDevnetApiError,
} from "@/services/devnetAirdropClient";
import type {
  AirdropState,
  EligibilityRecord,
  RewardRecord,
} from "@/types/airdrop";

/**
 * sleep 只用于 mock fallback 流程。
 *
 * 真实 devnet 执行会等待服务端 API route 和 Leo CLI 返回，
 * 不需要这里的人为延迟。
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建前端 mock Eligibility record。
 *
 * 这个 record 只用于 UI 演示：
 * - 不会写入链上；
 * - 不能作为真实 Aleo record 传给 claim_airdrop；
 * - 只在 mock fallback 模式下使用。
 */
function createMockEligibilityRecord(
  address: string,
  campaignId = DEFAULT_CAMPAIGN_ID,
): EligibilityRecord {
  return {
    id: createLocalRecordId(ELIGIBILITY_RECORD_ID_PREFIX),
    owner: address,
    campaignId,
    tier: DEFAULT_ELIGIBILITY_TIER,
    amount: DEFAULT_ELIGIBILITY_AMOUNT,
    deadline: DEFAULT_ELIGIBILITY_DEADLINE,
    plaintext: buildMockEligibilityPlaintext(address),
    isDevMock: true,
  };
}

/**
 * 根据本地 devnet 的 issue_eligibility 返回结果，
 * 构造真实 Eligibility record 的前端状态。
 */
function createDevnetEligibilityRecord(params: {
  owner: string;
  txId: string | null;
  rawRecord: string;
  campaignId: string;
}): EligibilityRecord {
  return {
    id: createLocalRecordId(ELIGIBILITY_RECORD_ID_PREFIX),
    owner: params.owner,
    campaignId: params.campaignId,
    tier: DEFAULT_ELIGIBILITY_TIER,
    amount: DEFAULT_ELIGIBILITY_AMOUNT,
    deadline: DEFAULT_ELIGIBILITY_DEADLINE,
    txId: params.txId ?? undefined,
    rawRecord: params.rawRecord,
    plaintext: params.rawRecord,
    isDevnetRecord: true,
  };
}

/**
 * 根据本地 devnet 的 claim_airdrop 返回结果，
 * 构造真实 Reward record 的前端状态。
 */
function createDevnetRewardRecord(params: {
  owner: string;
  campaignId: string;
  amount: string;
  txId: string | null;
  rawRecord: string;
}): RewardRecord {
  return {
    id: createLocalRecordId(REWARD_RECORD_ID_PREFIX),
    owner: params.owner,
    campaignId: params.campaignId,
    amount: params.amount,
    status: "unspent",
    txId: params.txId ?? undefined,
    rawRecord: params.rawRecord,
    isDevnetRecord: true,
  };
}

/**
 * 创建前端 mock Reward record。
 *
 * 这个 reward 只用于 mock fallback，不代表链上真实 Reward record。
 */
function createMockRewardRecord(params: {
  owner: string;
  campaignId: string;
  amount: string;
  txId: string;
}): RewardRecord {
  return {
    id: createLocalRecordId(REWARD_RECORD_ID_PREFIX),
    owner: params.owner,
    campaignId: params.campaignId,
    amount: params.amount,
    status: "unspent",
    txId: params.txId,
    isDevMock: true,
  };
}

/**
 * 从本地 devnet API 错误中提取 stdout / stderr。
 *
 * 这样前端可以展示 Leo CLI 的详细失败原因，
 * 比如合约 assert 失败、重复 claim、campaign 不存在等。
 */
function getDevnetErrorDetails(error: unknown) {
  if (!isDevnetApiError(error)) {
    return null;
  }

  return [
    error.stdout ? `stdout:\n${error.stdout}` : "",
    error.stderr ? `stderr:\n${error.stderr}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const useAirdropStore = create<AirdropState>((set, get) => ({
  campaign: null,
  campaignId: DEFAULT_CAMPAIGN_ID,
  campaignNotFound: false,

  eligibilityRecords: [],
  selectedEligibility: null,
  rewards: [],

  /**
   * 如果当前是本地 devnet 模式，则优先走真实合约执行。
   * 否则使用前端 mock fallback。
   */
  executionMode: ALEO_CONFIG.isDevnet ? "devnet" : "mock",

  isLoadingCampaign: false,
  isScanning: false,
  isClaiming: false,

  scanError: null,
  claimError: null,
  claimErrorDetails: null,
  campaignError: null,

  lastTxId: null,
  issueTxId: null,
  claimTxId: null,
  rawEligibilityRecord: null,
  rawRewardRecord: null,
  claimStatus: "idle",

  /**
   * 从 Aleo mapping 加载 campaign 状态。
   *
   * 实际读取的是：
   *   campaigns[campaignId]
   */
  loadCampaign: async (campaignId = DEFAULT_CAMPAIGN_ID) => {
    try {
      set({
        isLoadingCampaign: true,
        campaignError: null,
        campaignNotFound: false,
        campaignId,
      });

      const campaign = await getCampaign(campaignId);

      set({
        campaign,
        campaignNotFound: campaign === null,
        isLoadingCampaign: false,
      });
    } catch (error) {
      set({
        isLoadingCampaign: false,
        campaign: null,
        campaignNotFound: false,
        campaignError:
          error instanceof Error ? error.message : "Failed to load campaign",
      });
    }
  },

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
        rawEligibilityRecord: null,
      });

      console.log("[airdrop] scan start", { address, campaignId });

      if (ALEO_CONFIG.isDevnet) {
        /**
         * 本地 devnet 模式下，receiver 使用固定的 devnet admin 地址。
         *
         * 原因：
         * - 服务端 Leo CLI 使用固定 devnet 私钥；
         * - claim_airdrop 执行时 self.signer 也是这个地址；
         * - 合约要求 self.signer === eligibility.owner。
         *
         * 后续接入真实 Leo Wallet / 公共 testnet 时，
         * 这里可以替换成用户连接的钱包地址。
         */
        const result = await issueEligibilityDevnet({
          receiver: ALEO_CONFIG.devnetAdminAddress,
          campaignId,
          tier: DEFAULT_ELIGIBILITY_TIER,
          amount: DEFAULT_ELIGIBILITY_AMOUNT,
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
          owner: ALEO_CONFIG.devnetAdminAddress,
          txId: result.txId ?? null,
          rawRecord,
          campaignId,
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
          error instanceof Error ? error.message : AIRDROP_MESSAGES.scanFailed,
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
      issueTxId: null,
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
        const rawEligibilityRecord = get().rawEligibilityRecord;

        if (!rawEligibilityRecord) {
          throw new Error(AIRDROP_MESSAGES.eligibilityRecordParsingFailed);
        }

        const result = await claimAirdropDevnet({
          eligibilityRecord: rawEligibilityRecord,
          currentTime: DEFAULT_CLAIM_CURRENT_TIME,
        });

        if (!result.ok) {
          throw new Error(result.error ?? AIRDROP_MESSAGES.claimAirdropFailed);
        }

        const rawRewardRecord = result.rewardRecord ?? result.stdout ?? "";

        if (!rawRewardRecord) {
          throw new Error(AIRDROP_MESSAGES.rewardRecordParsingFailed);
        }

        const reward = createDevnetRewardRecord({
          owner: selectedEligibility.owner,
          campaignId: selectedEligibility.campaignId,
          amount: selectedEligibility.amount,
          txId: result.txId ?? null,
          rawRecord: rawRewardRecord,
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
        campaignId: selectedEligibility.campaignId,
        amount: selectedEligibility.amount,
        txId: mockTxId,
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
          error instanceof Error ? error.message : AIRDROP_MESSAGES.claimFailed,
        claimErrorDetails: getDevnetErrorDetails(error),
      });
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
}));
