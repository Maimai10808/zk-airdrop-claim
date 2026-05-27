import { AIRDROP_TASKS } from "@/constants/airdropTasks";
import type { AccountTaskProgress } from "@/types/airdropTask";

const STORAGE_KEY = "zk_airdrop_task_progress_v1";

type TaskProgressMap = Record<string, AccountTaskProgress>;

function hasLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readProgressMap(): TaskProgressMap {
  if (!hasLocalStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as TaskProgressMap) : {};
  } catch {
    return {};
  }
}

function writeProgressMap(progressMap: TaskProgressMap) {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
}

export function getAccountTaskProgress(
  accountId: string,
): AccountTaskProgress {
  const progressMap = readProgressMap();

  return (
    progressMap[accountId] ?? {
      accountId,
      completedTaskIds: [],
      updatedAt: Date.now(),
    }
  );
}

export function saveAccountTaskProgress(progress: AccountTaskProgress) {
  const progressMap = readProgressMap();

  progressMap[progress.accountId] = progress;
  writeProgressMap(progressMap);
}

export function completeNextTask(accountId: string): AccountTaskProgress {
  const current = getAccountTaskProgress(accountId);
  const completedSet = new Set(current.completedTaskIds);
  const nextTask = AIRDROP_TASKS.find((task) => !completedSet.has(task.id));

  if (!nextTask) {
    return current;
  }

  const progress = {
    accountId,
    completedTaskIds: [...current.completedTaskIds, nextTask.id],
    updatedAt: Date.now(),
  };

  saveAccountTaskProgress(progress);

  return progress;
}

export function resetAccountTaskProgress(
  accountId: string,
): AccountTaskProgress {
  const progress = {
    accountId,
    completedTaskIds: [],
    updatedAt: Date.now(),
  };

  saveAccountTaskProgress(progress);

  return progress;
}

export function getCompletedTaskIds(accountId: string) {
  return getAccountTaskProgress(accountId).completedTaskIds;
}
