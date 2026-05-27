/**
 * AirdropTask 表示本地 Demo 的空投任务。
 * 当前任务系统只做浏览器本地模拟，不接真实 Twitter / Discord API。
 */
export type AirdropTask = {
  id: string;
  order: number;
  title: string;
  description: string;
  rewardAmount: string;
  tier: string;
  mockActionLabel: string;
};

/**
 * AccountTaskProgress 表示某个 devnet account 在浏览器本地保存的任务进度。
 */
export type AccountTaskProgress = {
  accountId: string;
  completedTaskIds: string[];
  updatedAt: number;
};

/**
 * TaskEligibility 表示根据已完成任务计算出的资格等级和可领取额度。
 */
export type TaskEligibility = {
  completedCount: number;
  tier: string;
  amount: string;
  highestCompletedTaskId: string | null;
  nextTaskId: string | null;
  isEligible: boolean;
};
