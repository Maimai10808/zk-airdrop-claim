import type { CampaignState } from "@/services/aleoRestClient";
import type { TaskEligibility } from "@/types/airdropTask";
import type { PublicDevnetAccount } from "@/types/devnetAccount";

/**
 * EligibilityRecord 表示前端中展示和选择的资格记录。
 *
 * 注意：
 * - `id` 是前端本地生成的 UI id，不是 Aleo 链上的 record id。
 * - mock 模式下，record 只是前端模拟数据。
 * - devnet 模式下，record 来自本地 Leo CLI 真实执行 `issue_eligibility` 的输出。
 */
export type EligibilityRecord = {
  /**
   * 前端本地使用的唯一标识。
   * 用于在 Zustand 数组中选择、删除和展示记录。
   */
  id: string;

  /**
   * Eligibility record 的 owner。
   *
   * 在本地 devnet 多账户模式下，这里是当前选中账户地址。
   */
  owner: string;

  /**
   * 本地 devnet 账户 id，仅用于本地演示 UI。
   */
  accountId?: string;

  /**
   * 本地 devnet 账户标签，仅用于本地演示 UI。
   */
  accountLabel?: string;

  /**
   * 所属 campaign id，例如 `1u64`。
   */
  campaignId: string;

  /**
   * 用户等级，例如 `2u8`。
   */
  tier: string;

  /**
   * 可领取额度，例如 `1000u64`。
   */
  amount: string;

  /**
   * Eligibility record 的过期时间，例如 `1800u64`。
   */
  deadline: string;

  /**
   * 用于 UI 展示的明文内容。
   *
   * mock 模式下由前端拼接。
   * devnet 模式下来自 Leo CLI 输出。
   */
  plaintext?: string;

  /**
   * 预留字段，用于后续接入真实 record scanning 后保存密文 record。
   */
  ciphertext?: string;

  /**
   * 签发 Eligibility record 的交易 ID。
   */
  txId?: string;

  /**
   * 原始 record 字符串。
   *
   * devnet 模式下，这个字段会作为后续 `claim_airdrop` 的输入。
   */
  rawRecord?: string;

  /**
   * 标记该记录是否来自前端 mock fallback。
   */
  isDevMock?: boolean;

  /**
   * 标记该记录是否来自真实本地 devnet 执行。
   */
  isDevnetRecord?: boolean;

  /**
   * 生成该 Eligibility 时已完成的任务 id。
   */
  completedTaskIds?: string[];

  /**
   * 由任务进度计算出的 eligibility tier。
   */
  eligibilityTier?: string;
};

/**
 * RewardRecord 表示前端中展示的奖励记录。
 *
 * 注意：
 * - mock reward 只用于 UI 演示；
 * - devnet reward 来自真实执行 `claim_airdrop` 后的输出。
 */
export type RewardRecord = {
  /**
   * 前端本地使用的唯一标识。
   */
  id: string;

  /**
   * Reward record 的 owner。
   */
  owner: string;

  /**
   * 本地 devnet 账户 id，仅用于本地演示 UI。
   */
  accountId?: string;

  /**
   * 本地 devnet 账户标签，仅用于本地演示 UI。
   */
  accountLabel?: string;

  /**
   * 所属 campaign id，例如 `1u64`。
   */
  campaignId: string;

  /**
   * 奖励额度，例如 `1000u64`。
   */
  amount: string;

  /**
   * record 状态。
   *
   * 当前 Demo 中生成后默认是 `unspent`。
   */
  status: "unspent" | "spent";

  /**
   * 生成 Reward record 的交易 ID。
   */
  txId?: string;

  /**
   * 原始 Reward record 字符串。
   */
  rawRecord?: string;

  /**
   * 标记该奖励是否来自前端 mock fallback。
   */
  isDevMock?: boolean;

  /**
   * 标记该奖励是否来自真实本地 devnet 执行。
   */
  isDevnetRecord?: boolean;

  /**
   * 生成该 Reward 时对应的已完成任务 id。
   */
  completedTaskIds?: string[];

  /**
   * 该 Reward 对应的 eligibility tier。
   */
  eligibilityTier?: string;
};

/**
 * 当前领取流程的执行模式。
 *
 * - `mock`：只在前端模拟，不广播 Aleo 交易。
 * - `devnet`：通过 Next.js API route 调用本地 Leo CLI，真实执行合约。
 */
export type ExecutionMode = "mock" | "devnet";

/**
 * Claim 流程状态。
 */
export type ClaimStatus =
  | "idle"
  | "preparing"
  | "waiting_wallet"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "failed";

/**
 * 当前选中账户对当前 campaign 的链上领取状态。
 *
 * 该状态优先来自 claimed mapping 查询，不能只依赖前端 rewards 数组。
 */
export type AccountClaimStatus =
  | "unknown"
  | "checking"
  | "not_claimed"
  | "claimed"
  | "error";

/**
 * Zustand 空投状态结构。
 *
 * 这里集中描述页面需要的全部状态和动作。
 */
export type AirdropState = {
  /**
   * 从 Aleo mapping 读取到的真实 campaign 状态。
   */
  campaign: CampaignState | null;

  /**
   * 当前页面使用的 campaign id。
   */
  campaignId: string;

  /**
   * campaign mapping 是否不存在。
   */
  campaignNotFound: boolean;

  /**
   * 当前可用的 Eligibility records。
   */
  eligibilityRecords: EligibilityRecord[];

  /**
   * 用户当前选择的 Eligibility record。
   */
  selectedEligibility: EligibilityRecord | null;

  /**
   * 当前页面展示的 Reward records。
   */
  rewards: RewardRecord[];

  /**
   * 当前执行模式：mock 或 devnet。
   */
  executionMode: ExecutionMode;

  isLoadingCampaign: boolean;
  isScanning: boolean;
  isClaiming: boolean;

  scanError: string | null;
  claimError: string | null;
  claimErrorDetails: string | null;
  campaignError: string | null;

  /**
   * 最近一次交易 ID。
   */
  lastTxId: string | null;

  /**
   * issue_eligibility 交易 ID。
   */
  issueTxId: string | null;

  /**
   * claim_airdrop 交易 ID。
   */
  claimTxId: string | null;

  /**
   * 真实 Eligibility record 原始字符串。
   */
  rawEligibilityRecord: string | null;

  /**
   * 真实 Reward record 原始字符串。
   */
  rawRewardRecord: string | null;

  /**
   * 浏览器可见的本地 devnet 账户列表。
   *
   * 这里只允许保存 id / label / address，不允许保存 privateKey。
   */
  devnetAccounts: PublicDevnetAccount[];

  /**
   * 当前选中的本地 devnet 账户。
   */
  selectedDevnetAccount: PublicDevnetAccount | null;

  isLoadingDevnetAccounts: boolean;
  devnetAccountError: string | null;

  /**
   * 当前选中账户在 claimed mapping 中的状态。
   */
  accountClaimStatus: AccountClaimStatus;

  /**
   * 当前选中账户 + campaignId 计算出的 claimed mapping key。
   */
  accountClaimKey: string | null;

  accountClaimStatusError: string | null;
  isCheckingAccountClaimStatus: boolean;

  /**
   * 当前选中账户在本地 demo 中完成的任务 ids。
   */
  completedTaskIds: string[];

  /**
   * 根据当前账户任务进度计算出的 tier / amount。
   */
  taskEligibility: TaskEligibility;

  isLoadingTaskProgress: boolean;
  taskProgressError: string | null;

  lastCompletedTaskId: string | null;
  lastCompletedTaskTitle: string | null;
  lastRewardAnimation: {
    tier: string;
    amount: string;
    taskTitle?: string;
    isFinal: boolean;
  } | null;

  /**
   * 当前 claim 状态。
   */
  claimStatus: ClaimStatus;

  loadCampaign: (campaignId?: string) => Promise<void>;
  loadDevnetAccounts: () => Promise<void>;
  loadSelectedAccountClaimStatus: (campaignId?: string) => Promise<void>;
  loadSelectedAccountTaskProgress: () => void;
  completeSelectedAccountNextTask: () => void;
  resetSelectedAccountTasks: () => void;
  clearLastRewardAnimation: () => void;
  selectDevnetAccount: (accountId: string) => void;
  scanEligibility: (address: string, campaignId?: string) => Promise<void>;
  useMockEligibilityFallback: (address: string, campaignId?: string) => void;
  selectEligibility: (recordId: string) => void;
  claimSelectedEligibility: () => Promise<void>;
  executeClaimAirdrop: () => Promise<void>;
  resetClaimState: () => void;
};
