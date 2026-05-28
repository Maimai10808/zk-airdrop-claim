"use client";

import { AlertTriangle, Gift, Sparkles, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmEligibilityIssueDialogProps = {
  open: boolean;
  completedCount: number;
  totalTasks: number;
  tier: string;
  amount: string;
  isMaxTier: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmEligibilityIssueDialog({
  open,
  completedCount,
  totalTasks,
  tier,
  amount,
  isMaxTier,
  onCancel,
  onConfirm,
}: ConfirmEligibilityIssueDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent
        className={
          isMaxTier
            ? "border border-emerald-500/30 bg-zinc-950 text-zinc-100 shadow-[0_0_90px_rgba(16,185,129,0.18)]"
            : "border border-yellow-500/20 bg-zinc-950 text-zinc-100 shadow-[0_0_80px_rgba(250,204,21,0.12)]"
        }
      >
        <DialogHeader>
          <div
            className={
              isMaxTier
                ? "mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                : "mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200"
            }
          >
            {isMaxTier ? (
              <Trophy className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            {isMaxTier ? "Max tier ready" : "Eligibility checkpoint"}
          </div>

          <DialogTitle className="text-lg text-zinc-100">
            {isMaxTier
              ? "Max eligibility unlocked!"
              : "Confirm current eligibility tier?"}
          </DialogTitle>

          <DialogDescription className="leading-6 text-zinc-400">
            {isMaxTier
              ? `You have completed all ${totalTasks} tasks.`
              : `You have completed ${completedCount} / ${totalTasks} tasks.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500">Current tier</p>
            <p
              className={
                isMaxTier
                  ? "mt-1 font-mono text-lg text-emerald-300"
                  : "mt-1 font-mono text-lg text-yellow-200"
              }
            >
              {tier}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Claimable amount</p>
            <p className="mt-1 font-mono text-lg text-emerald-300">{amount}</p>
          </div>
        </div>

        {isMaxTier ? (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
            You are about to issue the highest eligibility record for this
            campaign.
          </p>
        ) : (
          <p className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
            This eligibility record will be generated from your current task
            progress. If you issue eligibility now and claim later, this account
            can only claim this campaign once. You can cancel and complete more
            tasks to unlock a higher reward.
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={
              isMaxTier
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            }
          >
            {isMaxTier ? (
              <Sparkles className="mr-2 h-4 w-4" />
            ) : (
              <Gift className="mr-2 h-4 w-4" />
            )}
            {isMaxTier ? "Issue Max Eligibility" : "Issue Eligibility"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
