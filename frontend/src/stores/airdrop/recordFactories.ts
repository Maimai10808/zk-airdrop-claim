import {
  DEFAULT_CAMPAIGN_ID,
  DEFAULT_ELIGIBILITY_DEADLINE,
  ELIGIBILITY_RECORD_ID_PREFIX,
  REWARD_RECORD_ID_PREFIX,
  buildMockEligibilityPlaintext,
  createLocalRecordId,
} from "@/constants/airdrop";
import type { EligibilityRecord, RewardRecord } from "@/types/airdrop";

/**
 * sleep 只用于 mock fallback 流程。
 *
 * 真实 devnet 执行会等待服务端 API route 和 Leo CLI 返回，
 * 不需要这里的人为延迟。
 */
export function sleep(ms: number) {
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
export function createMockEligibilityRecord(
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
export function createDevnetEligibilityRecord(params: {
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
export function createDevnetRewardRecord(params: {
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
export function createMockRewardRecord(params: {
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
