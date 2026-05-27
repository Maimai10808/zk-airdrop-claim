import type { AirdropTask, TaskEligibility } from "@/types/airdropTask";

/**
 * 本地 demo 任务系统。
 *
 * 这些任务只用于 hackathon 演示，不接真实社交平台 API，
 * 任务进度由浏览器 localStorage 保存。
 */
export const AIRDROP_TASKS: AirdropTask[] = [
  {
    id: "follow",
    order: 1,
    title: "Follow Project",
    description: "Follow the project account to start the airdrop journey.",
    rewardAmount: "250u64",
    tier: "1u8",
    mockActionLabel: "Follow",
  },
  {
    id: "share",
    order: 2,
    title: "Share Campaign",
    description: "Share the campaign with your community.",
    rewardAmount: "500u64",
    tier: "2u8",
    mockActionLabel: "Share",
  },
  {
    id: "join",
    order: 3,
    title: "Join Community",
    description: "Join the community and verify participation.",
    rewardAmount: "750u64",
    tier: "3u8",
    mockActionLabel: "Join",
  },
  {
    id: "zk",
    order: 4,
    title: "Complete ZK Action",
    description: "Complete a privacy-preserving ZK claim action.",
    rewardAmount: "1000u64",
    tier: "4u8",
    mockActionLabel: "Complete",
  },
];

export function getTaskEligibility(
  completedTaskIds: string[],
): TaskEligibility {
  const completedSet = new Set(completedTaskIds);
  const orderedCompletedTasks = AIRDROP_TASKS.filter((task) =>
    completedSet.has(task.id),
  ).sort((a, b) => a.order - b.order);
  const highestCompletedTask =
    orderedCompletedTasks[orderedCompletedTasks.length - 1] ?? null;
  const nextTask =
    AIRDROP_TASKS.find((task) => !completedSet.has(task.id)) ?? null;

  return {
    completedCount: orderedCompletedTasks.length,
    tier: highestCompletedTask?.tier ?? "0u8",
    amount: highestCompletedTask?.rewardAmount ?? "0u64",
    highestCompletedTaskId: highestCompletedTask?.id ?? null,
    nextTaskId: nextTask?.id ?? null,
    isEligible: orderedCompletedTasks.length > 0,
  };
}
