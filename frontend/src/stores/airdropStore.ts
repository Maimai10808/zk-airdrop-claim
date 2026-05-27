import { create } from "zustand";

import { ALEO_CONFIG } from "@/config/aleo";
import { AIRDROP_TASKS, getTaskEligibility } from "@/constants/airdropTasks";
import {
  AIRDROP_MESSAGES,
  DEFAULT_CAMPAIGN_ID,
  DEFAULT_CLAIM_CURRENT_TIME,
  DEFAULT_ELIGIBILITY_DEADLINE,
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
import { getDevnetAccounts } from "@/services/devnetAccountClient";
import { getDevnetClaimStatus } from "@/services/devnetClaimStatusClient";
import {
  completeNextTask,
  getAccountTaskProgress,
  resetAccountTaskProgress,
} from "@/services/taskProgressStorage";
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

const ACCOUNT_ALREADY_CLAIMED_MESSAGE =
  "This account has already claimed this campaign.";

const ACCOUNT_ALREADY_CLAIMED_ISSUE_MESSAGE =
  "This account has already claimed this campaign. A claimed account cannot issue a new eligibility record for the same campaign.";

const TASK_PROGRESS_LOCKED_MESSAGE =
  "This account has already claimed this campaign. Task progress is locked.";

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
    tier: "2u8",
    amount: "1000u64",
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
  accountId?: string;
  accountLabel?: string;
  txId: string | null;
  rawRecord: string;
  campaignId: string;
  tier: string;
  amount: string;
  completedTaskIds?: string[];
}): EligibilityRecord {
  return {
    id: createLocalRecordId(ELIGIBILITY_RECORD_ID_PREFIX),
    owner: params.owner,
    accountId: params.accountId,
    accountLabel: params.accountLabel,
    campaignId: params.campaignId,
    tier: params.tier,
    amount: params.amount,
    deadline: DEFAULT_ELIGIBILITY_DEADLINE,
    txId: params.txId ?? undefined,
    rawRecord: params.rawRecord,
    plaintext: params.rawRecord,
    isDevnetRecord: true,
    completedTaskIds: params.completedTaskIds,
    eligibilityTier: params.tier,
  };
}

/**
 * 根据本地 devnet 的 claim_airdrop 返回结果，
 * 构造真实 Reward record 的前端状态。
 */
function createDevnetRewardRecord(params: {
  owner: string;
  accountId?: string;
  accountLabel?: string;
  campaignId: string;
  amount: string;
  txId: string | null;
  rawRecord: string;
  completedTaskIds?: string[];
  eligibilityTier?: string;
}): RewardRecord {
  return {
    id: createLocalRecordId(REWARD_RECORD_ID_PREFIX),
    owner: params.owner,
    accountId: params.accountId,
    accountLabel: params.accountLabel,
    campaignId: params.campaignId,
    amount: params.amount,
    status: "unspent",
    txId: params.txId ?? undefined,
    rawRecord: params.rawRecord,
    isDevnetRecord: true,
    completedTaskIds: params.completedTaskIds,
    eligibilityTier: params.eligibilityTier,
  };
}

/**
 * 创建前端 mock Reward record。
 *
 * 这个 reward 只用于 mock fallback，不代表链上真实 Reward record。
 */
function createMockRewardRecord(params: {
  owner: string;
  accountId?: string;
  accountLabel?: string;
  campaignId: string;
  amount: string;
  txId: string;
  completedTaskIds?: string[];
  eligibilityTier?: string;
}): RewardRecord {
  return {
    id: createLocalRecordId(REWARD_RECORD_ID_PREFIX),
    owner: params.owner,
    accountId: params.accountId,
    accountLabel: params.accountLabel,
    campaignId: params.campaignId,
    amount: params.amount,
    status: "unspent",
    txId: params.txId,
    isDevMock: true,
    completedTaskIds: params.completedTaskIds,
    eligibilityTier: params.eligibilityTier,
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
  devnetAccounts: [],
  selectedDevnetAccount: null,
  isLoadingDevnetAccounts: false,
  devnetAccountError: null,
  accountClaimStatus: "unknown",
  accountClaimKey: null,
  accountClaimStatusError: null,
  isCheckingAccountClaimStatus: false,
  completedTaskIds: [],
  taskEligibility: getTaskEligibility([]),
  isLoadingTaskProgress: false,
  taskProgressError: null,
  lastCompletedTaskId: null,
  lastCompletedTaskTitle: null,
  lastRewardAnimation: null,
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

      if (ALEO_CONFIG.isDevnet) {
        await get().loadSelectedAccountClaimStatus(campaignId);
      }
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

  loadSelectedAccountTaskProgress: () => {
    const selectedDevnetAccount = get().selectedDevnetAccount;

    if (!selectedDevnetAccount) {
      set({
        completedTaskIds: [],
        taskEligibility: getTaskEligibility([]),
        isLoadingTaskProgress: false,
        taskProgressError: null,
      });
      return;
    }

    try {
      set({
        isLoadingTaskProgress: true,
        taskProgressError: null,
      });

      const progress = getAccountTaskProgress(selectedDevnetAccount.id);

      set({
        completedTaskIds: progress.completedTaskIds,
        taskEligibility: getTaskEligibility(progress.completedTaskIds),
        isLoadingTaskProgress: false,
        taskProgressError: null,
      });
    } catch (error) {
      set({
        isLoadingTaskProgress: false,
        taskProgressError:
          error instanceof Error
            ? error.message
            : "Failed to load task progress",
      });
    }
  },

  completeSelectedAccountNextTask: () => {
    const selectedDevnetAccount = get().selectedDevnetAccount;

    if (!selectedDevnetAccount) {
      set({ taskProgressError: "Select a devnet account first." });
      return;
    }

    if (get().accountClaimStatus === "claimed") {
      set({ taskProgressError: TASK_PROGRESS_LOCKED_MESSAGE });
      return;
    }

    try {
      const beforeCompletedIds = get().completedTaskIds;
      const progress = completeNextTask(selectedDevnetAccount.id);
      const completedTaskId = progress.completedTaskIds.find(
        (taskId) => !beforeCompletedIds.includes(taskId),
      );
      const completedTask =
        AIRDROP_TASKS.find((task) => task.id === completedTaskId) ?? null;
      const nextEligibility = getTaskEligibility(progress.completedTaskIds);

      set({
        completedTaskIds: progress.completedTaskIds,
        taskEligibility: nextEligibility,
        taskProgressError: null,
        lastCompletedTaskId: completedTask?.id ?? null,
        lastCompletedTaskTitle: completedTask?.title ?? null,
        lastRewardAnimation: completedTask
          ? {
              tier: nextEligibility.tier,
              amount: nextEligibility.amount,
              taskTitle: completedTask.title,
              isFinal: nextEligibility.completedCount === AIRDROP_TASKS.length,
            }
          : null,
      });
    } catch (error) {
      set({
        taskProgressError:
          error instanceof Error
            ? error.message
            : "Failed to complete next task",
      });
    }
  },

  resetSelectedAccountTasks: () => {
    const selectedDevnetAccount = get().selectedDevnetAccount;

    if (!selectedDevnetAccount) {
      return;
    }

    if (get().accountClaimStatus === "claimed") {
      set({ taskProgressError: TASK_PROGRESS_LOCKED_MESSAGE });
      return;
    }

    try {
      const progress = resetAccountTaskProgress(selectedDevnetAccount.id);

      set({
        completedTaskIds: progress.completedTaskIds,
        taskEligibility: getTaskEligibility(progress.completedTaskIds),
        taskProgressError: null,
        lastCompletedTaskId: null,
        lastCompletedTaskTitle: null,
        lastRewardAnimation: null,
      });
    } catch (error) {
      set({
        taskProgressError:
          error instanceof Error ? error.message : "Failed to reset tasks",
      });
    }
  },

  clearLastRewardAnimation: () => {
    set({
      lastRewardAnimation: null,
    });
  },

  selectDevnetAccount: (accountId: string) => {
    const account = get().devnetAccounts.find((item) => item.id === accountId);

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
          throw new Error("Checking claim status. Please wait before issuing eligibility.");
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
          throw new Error("Checking claim status. Please wait before claiming.");
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
          throw new Error(result.error ?? AIRDROP_MESSAGES.claimAirdropFailed);
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
          error instanceof Error ? error.message : AIRDROP_MESSAGES.claimFailed,
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
}));
