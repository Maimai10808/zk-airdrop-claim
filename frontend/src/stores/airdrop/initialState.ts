import type { AirdropState } from "@/types/airdrop";

import { ALEO_CONFIG } from "@/config/aleo";
import { getTaskEligibility } from "@/constants/airdropTasks";
import { DEFAULT_CAMPAIGN_ID } from "@/constants/airdrop";

export const initialAirdropState: Omit<
  AirdropState,
  | "loadCampaign"
  | "loadDevnetAccounts"
  | "selectDevnetAccount"
  | "loadSelectedAccountClaimStatus"
  | "loadSelectedAccountTaskProgress"
  | "completeSelectedAccountNextTask"
  | "resetSelectedAccountTasks"
  | "clearLastRewardAnimation"
  | "scanEligibility"
  | "useMockEligibilityFallback"
  | "selectEligibility"
  | "claimSelectedEligibility"
  | "executeClaimAirdrop"
  | "resetClaimState"
> = {
  campaign: null,
  campaignId: DEFAULT_CAMPAIGN_ID,
  campaignNotFound: false,

  eligibilityRecords: [],
  selectedEligibility: null,
  rewards: [],

  executionMode: ALEO_CONFIG.isDevnet ? "devnet" : "mock",

  isLoadingCampaign: false,
  isScanning: false,
  isClaiming: false,

  scanError: null,
  claimError: null,
  claimErrorDetails: null,
  campaignError: null,

  lastTxId: null,
  issueTxId: null,
  claimTxId: null,
  rawEligibilityRecord: null,
  rawRewardRecord: null,

  devnetAccounts: [],
  selectedDevnetAccount: null,
  isLoadingDevnetAccounts: false,
  devnetAccountError: null,

  accountClaimStatus: "unknown",
  accountClaimKey: null,
  accountClaimStatusError: null,
  isCheckingAccountClaimStatus: false,

  completedTaskIds: [],
  taskEligibility: getTaskEligibility([]),
  isLoadingTaskProgress: false,
  taskProgressError: null,

  lastCompletedTaskId: null,
  lastCompletedTaskTitle: null,
  lastRewardAnimation: null,

  claimStatus: "idle",
};
