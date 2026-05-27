/**
 * 空投 Demo 相关常量。
 *
 * 这里集中管理本地 devnet、mock fallback 和前端状态中复用的值。
 * 这样可以避免在 store 中到处写死 `1u64`、`2u8`、`1000u64` 等 Leo 字面量。
 */

/**
 * 本地 devnet Demo 默认使用的 campaign id。
 *
 * 合约中对应：
 *   campaigns[DEFAULT_CAMPAIGN_ID]
 */
export const DEFAULT_CAMPAIGN_ID = "1u64";

/**
 * 默认签发的 Eligibility record 字段。
 *
 * 当前 Demo 使用的是：
 * - campaign: 1
 * - tier: 2
 * - amount: 1000
 * - eligibility deadline: 1800
 */
export const DEFAULT_ELIGIBILITY_TIER = "2u8";
export const DEFAULT_ELIGIBILITY_AMOUNT = "1000u64";
export const DEFAULT_ELIGIBILITY_DEADLINE = "1800u64";

/**
 * 本地 devnet 执行 claim_airdrop 时使用的 current_time。
 *
 * 这个值必须小于等于：
 * - eligibility.deadline
 * - campaign.deadline
 */
export const DEFAULT_CLAIM_CURRENT_TIME = "1000u64";

/**
 * 前端本地 record id 前缀。
 *
 * 注意：这些不是 Aleo 链上的 record id。
 * 它们只是 UI 状态管理用的本地 id。
 */
export const ELIGIBILITY_RECORD_ID_PREFIX = "eligibility";
export const REWARD_RECORD_ID_PREFIX = "reward";
export const MOCK_TX_ID_PREFIX = "mock_tx";

/**
 * mock fallback 流程中的人为延迟。
 *
 * 这些延迟只用于模拟钱包确认、交易提交和网络确认。
 * 真实 devnet 执行不会使用这些延迟。
 */
export const MOCK_SCAN_DELAY_MS = 1000;
export const MOCK_PREPARE_DELAY_MS = 700;
export const MOCK_WALLET_DELAY_MS = 900;
export const MOCK_CONFIRM_DELAY_MS = 1200;

/**
 * 空投流程中复用的错误提示。
 */
export const AIRDROP_MESSAGES = {
  selectEligibilityFirst: "Please select an Eligibility record first.",
  scanFailed: "Failed to scan records",
  issueEligibilityFailed: "Failed to issue Eligibility record",
  claimFailed: "Claim failed",
  claimAirdropFailed: "Failed to claim airdrop",
  eligibilityRecordParsingFailed:
    "Eligibility record parsing failed. Please inspect issue_eligibility stdout.",
  rewardRecordParsingFailed:
    "Reward record parsing failed. Claim succeeded; inspect claim_airdrop stdout.",
} as const;

/**
 * 构造 mock Eligibility record 的 plaintext。
 *
 * 这个函数只用于前端 mock fallback。
 * 它生成的内容不是 Aleo 真实 record，不能传给 claim_airdrop。
 */
export function buildMockEligibilityPlaintext(owner: string) {
  return `{ owner: ${owner}, campaign_id: ${DEFAULT_CAMPAIGN_ID}, tier: ${DEFAULT_ELIGIBILITY_TIER}, amount: ${DEFAULT_ELIGIBILITY_AMOUNT}, deadline: ${DEFAULT_ELIGIBILITY_DEADLINE} }`;
}

/**
 * 创建前端本地 record id。
 *
 * 这个 id 只用于 UI 状态管理，不代表链上真实 record id。
 */
export function createLocalRecordId(prefix: string) {
  return `${prefix}_${Date.now()}`;
}
