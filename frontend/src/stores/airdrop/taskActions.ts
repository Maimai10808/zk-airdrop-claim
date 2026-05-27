import { AIRDROP_TASKS, getTaskEligibility } from "@/constants/airdropTasks";
import {
  completeNextTask,
  getAccountTaskProgress,
  resetAccountTaskProgress,
} from "@/services/taskProgressStorage";

import { TASK_PROGRESS_LOCKED_MESSAGE } from "./messages";
import type { AirdropGet, AirdropSet } from "./types";

export function createTaskActions(set: AirdropSet, get: AirdropGet) {
  return {
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
                isFinal:
                  nextEligibility.completedCount === AIRDROP_TASKS.length,
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
  };
}
