"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmPartialClaimDialogProps = {
  open: boolean;
  completedCount: number;
  totalTasks: number;
  tier: string;
  amount: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmPartialClaimDialog({
  open,
  completedCount,
  totalTasks,
  tier,
  amount,
  onCancel,
  onConfirm,
}: ConfirmPartialClaimDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="border border-yellow-500/20 bg-zinc-950 text-zinc-100 shadow-[0_0_80px_rgba(250,204,21,0.12)]">
        <DialogHeader>
          <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            One-time claim
          </div>

          <DialogTitle className="text-lg text-zinc-100">
            Claim with current task tier?
          </DialogTitle>

          <DialogDescription className="leading-6 text-zinc-400">
            You have completed {completedCount} / {totalTasks} tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500">Current reward</p>
            <p className="mt-1 font-mono text-lg text-emerald-300">
              {amount}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Current tier</p>
            <p className="mt-1 font-mono text-lg text-yellow-200">{tier}</p>
          </div>
        </div>

        <p className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100">
          This campaign can only be claimed once per account. If you claim now,
          you will not be able to complete more tasks later for a higher reward
          in this campaign.
        </p>

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
            className="bg-yellow-400 text-black hover:bg-yellow-300"
          >
            Claim Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
