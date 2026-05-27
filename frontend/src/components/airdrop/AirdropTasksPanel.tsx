"use client";

import { CheckCircle2, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { ALEO_CONFIG } from "@/config/aleo";
import { AIRDROP_TASKS } from "@/constants/airdropTasks";
import { useAirdropStore } from "@/stores/airdropStore";
import {
  AnimatedPanel,
  QuestCompletionBurst,
  QuestRewardBurst,
  StaggerContainer,
  StaggerItem,
  StatusPulse,
} from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function shortAddress(address: string) {
  return address.length <= 16
    ? address
    : `${address.slice(0, 9)}...${address.slice(-5)}`;
}

export function AirdropTasksPanel() {
  const {
    selectedDevnetAccount,
    accountClaimStatus,
    completedTaskIds,
    taskEligibility,
    taskProgressError,
    lastRewardAnimation,
    completeSelectedAccountNextTask,
    resetSelectedAccountTasks,
    clearLastRewardAnimation,
  } = useAirdropStore();

  if (!ALEO_CONFIG.isDevnet) {
    return null;
  }

  const completedSet = new Set(completedTaskIds);
  const lockedByClaim = accountClaimStatus === "claimed";
  const allCompleted = completedTaskIds.length >= AIRDROP_TASKS.length;
  const nextTaskId = taskEligibility.nextTaskId;
  const canComplete =
    Boolean(selectedDevnetAccount) && !lockedByClaim && !allCompleted;
  const canReset =
    Boolean(selectedDevnetAccount) && !lockedByClaim && completedTaskIds.length > 0;

  return (
    <AnimatedPanel>
      <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950 text-white">
        <QuestRewardBurst
          visible={Boolean(
            !lockedByClaim &&
              lastRewardAnimation &&
              !lastRewardAnimation.isFinal,
          )}
          tier={lastRewardAnimation?.tier ?? "0u8"}
          amount={lastRewardAnimation?.amount ?? "0u64"}
          taskTitle={lastRewardAnimation?.taskTitle}
          onComplete={clearLastRewardAnimation}
        />
        <QuestCompletionBurst
          visible={Boolean(!lockedByClaim && lastRewardAnimation?.isFinal)}
          tier={lastRewardAnimation?.tier ?? "0u8"}
          amount={lastRewardAnimation?.amount ?? "0u64"}
          onComplete={clearLastRewardAnimation}
        />

        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Airdrop Tasks</CardTitle>
          <StatusPulse
            label={lockedByClaim ? "Already Claimed" : "Quest Active"}
            tone={lockedByClaim ? "red" : "green"}
          />
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-sm text-zinc-500">Current Account</p>
            <p className="mt-1 text-sm font-medium text-zinc-100">
              {selectedDevnetAccount?.label ?? "No account selected"}
            </p>
            <p className="mt-1 break-all font-mono text-xs text-emerald-300">
              {selectedDevnetAccount
                ? shortAddress(selectedDevnetAccount.address)
                : "-"}
            </p>

            {lockedByClaim ? (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
                <p>
                  This account already claimed this campaign. Task progress is
                  locked.
                </p>
                <p className="mt-1">
                  You do not need to complete more tasks for this campaign.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-zinc-400">
                Complete tasks in order to build a higher eligibility tier.
              </p>
            )}
          </div>

          <StaggerContainer className="space-y-3">
            {AIRDROP_TASKS.map((task) => {
              const completed = completedSet.has(task.id);
              const available =
                !lockedByClaim && !completed && task.id === nextTaskId;
              const status = lockedByClaim
                ? "Claimed Locked"
                : completed
                ? "Completed"
                : available
                  ? "Available"
                  : "Locked";

              return (
                <StaggerItem key={task.id}>
                  <motion.div
                    animate={
                      available
                        ? {
                            boxShadow: [
                              "0 0 0 rgba(250,204,21,0)",
                              "0 0 26px rgba(250,204,21,0.18)",
                              "0 0 0 rgba(250,204,21,0)",
                            ],
                          }
                        : undefined
                    }
                    transition={
                      available
                        ? {
                            duration: 1.9,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : undefined
                    }
                    className={`rounded-2xl border p-4 ${
                      lockedByClaim
                        ? "border-zinc-800 bg-zinc-900/40 opacity-50 grayscale"
                        : completed
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : available
                          ? "border-yellow-500/30 bg-yellow-500/10"
                          : "border-zinc-800 bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-black/30 font-mono text-xs text-zinc-300">
                            {lockedByClaim ? (
                              <LockKeyhole className="h-4 w-4 text-zinc-500" />
                            ) : completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            ) : available ? (
                              <Sparkles className="h-4 w-4 text-yellow-300" />
                            ) : (
                              <LockKeyhole className="h-4 w-4 text-zinc-500" />
                            )}
                          </span>
                          <h3 className="font-medium text-zinc-100">
                            {task.title}
                          </h3>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          {task.description}
                        </p>
                      </div>

                      <Badge
                        className={
                          lockedByClaim
                            ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-800"
                            : completed
                            ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
                            : available
                              ? "bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/10"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-800"
                        }
                      >
                        {status}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-zinc-500">Tier</p>
                        <p className="mt-1 font-mono text-emerald-300">
                          {task.tier}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Reward</p>
                        <p className="mt-1 font-mono text-emerald-300">
                          {task.rewardAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Action</p>
                        <p className="mt-1 text-zinc-300">
                          {task.mockActionLabel}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <div className="grid gap-3 sm:grid-cols-2">
            <motion.div
              whileHover={canComplete ? { y: -2, scale: 1.01 } : undefined}
              whileTap={canComplete ? { scale: 0.98 } : undefined}
              className="rounded-md"
            >
              <Button
                type="button"
                onClick={completeSelectedAccountNextTask}
                disabled={!canComplete}
                className="w-full bg-emerald-500 text-black shadow-[0_0_26px_rgba(16,185,129,0.18)] hover:bg-emerald-400 hover:shadow-[0_0_34px_rgba(16,185,129,0.32)] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
              >
                {allCompleted ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Complete Next Task
              </Button>
            </motion.div>

            <Button
              type="button"
              variant="outline"
              onClick={resetSelectedAccountTasks}
              disabled={!canReset}
              className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-500"
            >
              {lockedByClaim ? (
                <LockKeyhole className="mr-2 h-4 w-4" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              Reset Tasks
            </Button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-zinc-500">Completed Tasks</p>
                <p className="mt-1 font-mono text-sm text-zinc-100">
                  {taskEligibility.completedCount} / {AIRDROP_TASKS.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Current Tier</p>
                <p className="mt-1 font-mono text-sm text-emerald-300">
                  {taskEligibility.tier}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Claimable Amount</p>
                <p className="mt-1 font-mono text-sm text-emerald-300">
                  {taskEligibility.amount}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Eligibility</p>
                <p className="mt-1 text-sm text-zinc-100">
                  {lockedByClaim
                    ? "Locked"
                    : taskEligibility.isEligible
                      ? "Eligible"
                      : "Not Eligible"}
                </p>
              </div>
            </div>

            {!lockedByClaim && !taskEligibility.isEligible ? (
              <p className="mt-3 text-xs text-yellow-200">
                Complete at least one task to become eligible.
              </p>
            ) : null}

            {taskProgressError ? (
              <p className="mt-3 text-xs text-red-400">{taskProgressError}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </AnimatedPanel>
  );
}
