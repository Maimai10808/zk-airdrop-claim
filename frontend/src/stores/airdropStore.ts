import { create } from "zustand";

import { ALEO_CONFIG } from "@/config/aleo";
import { getCampaign, type CampaignState } from "@/services/aleoRestClient";
import {
  claimAirdropDevnet,
  issueEligibilityDevnet,
  isDevnetApiError,
} from "@/services/devnetAirdropClient";

export type EligibilityRecord = {
  id: string;
  owner: string;
  campaignId: string;
  tier: string;
  amount: string;
  deadline: string;
  plaintext?: string;
  ciphertext?: string;
  txId?: string;
  rawRecord?: string;
  isDevMock?: boolean;
  isDevnetRecord?: boolean;
};

export type RewardRecord = {
  id: string;
  owner: string;
  campaignId: string;
  amount: string;
  status: "unspent" | "spent";
  txId?: string;
  rawRecord?: string;
  isDevMock?: boolean;
  isDevnetRecord?: boolean;
};

export type ExecutionMode = "mock" | "devnet";

export type ClaimStatus =
  | "idle"
  | "preparing"
  | "waiting_wallet"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "failed";

type AirdropState = {
  campaign: CampaignState | null;
  campaignId: string;
  campaignNotFound: boolean;

  eligibilityRecords: EligibilityRecord[];
  selectedEligibility: EligibilityRecord | null;
  rewards: RewardRecord[];
  executionMode: ExecutionMode;

  isLoadingCampaign: boolean;
  isScanning: boolean;
  isClaiming: boolean;

  scanError: string | null;
  claimError: string | null;
  claimErrorDetails: string | null;
  campaignError: string | null;

  lastTxId: string | null;
  issueTxId: string | null;
  claimTxId: string | null;
  rawEligibilityRecord: string | null;
  rawRewardRecord: string | null;
  claimStatus: ClaimStatus;

  loadCampaign: (campaignId?: string) => Promise<void>;
  scanEligibility: (address: string, campaignId?: string) => Promise<void>;
  useMockEligibilityFallback: (address: string, campaignId?: string) => void;
  selectEligibility: (recordId: string) => void;
  claimSelectedEligibility: () => Promise<void>;
  executeClaimAirdrop: () => Promise<void>;
  resetClaimState: () => void;
};

function createMockEligibilityRecord(address: string): EligibilityRecord {
  return {
    id: `eligibility_${Date.now()}`,
    owner: address,
    campaignId: "1u64",
    tier: "2u8",
    amount: "1000u64",
    deadline: "1800u64",
    plaintext:
      "{ owner: " +
      address +
      ", campaign_id: 1u64, tier: 2u8, amount: 1000u64, deadline: 1800u64 }",
    isDevMock: true,
  };
}

export const useAirdropStore = create<AirdropState>((set, get) => ({
  campaign: null,
  campaignId: "1u64",
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
  claimStatus: "idle",

  loadCampaign: async (campaignId = "1u64") => {
    try {
      set({
        isLoadingCampaign: true,
        campaignError: null,
        campaignNotFound: false,
        campaignId,
      });

      const campaign = await getCampaign(campaignId);

      set({
        campaign,
        campaignNotFound: campaign === null,
        isLoadingCampaign: false,
      });
    } catch (error) {
      set({
        isLoadingCampaign: false,
        campaign: null,
        campaignNotFound: false,
        campaignError:
          error instanceof Error ? error.message : "Failed to load campaign",
      });
    }
  },

  scanEligibility: async (address: string, campaignId = "1u64") => {
    try {
      set({
        isScanning: true,
        scanError: null,
        eligibilityRecords: [],
        selectedEligibility: null,
        issueTxId: null,
        rawEligibilityRecord: null,
      });

      console.log("[airdrop] scan start", { address, campaignId });

      if (ALEO_CONFIG.isDevnet) {
        const result = await issueEligibilityDevnet({
          receiver: ALEO_CONFIG.devnetAdminAddress,
          campaignId: "1u64",
          tier: "2u8",
          amount: "1000u64",
          deadline: "1800u64",
        });

        if (!result.ok) {
          throw new Error(result.error ?? "Failed to issue Eligibility record");
        }

        const record: EligibilityRecord = {
          id: `eligibility_${Date.now()}`,
          owner: ALEO_CONFIG.devnetAdminAddress,
          campaignId: "1u64",
          tier: "2u8",
          amount: "1000u64",
          deadline: "1800u64",
          txId: result.txId ?? undefined,
          rawRecord: result.eligibilityRecord ?? result.stdout,
          plaintext: result.eligibilityRecord ?? result.stdout,
          isDevnetRecord: true,
        };

        set({
          executionMode: "devnet",
          isScanning: false,
          eligibilityRecords: [record],
          selectedEligibility: record,
          issueTxId: result.txId ?? null,
          rawEligibilityRecord: result.eligibilityRecord ?? null,
          scanError: result.eligibilityRecord
            ? null
            : "Eligibility record parsing failed. Please inspect issue_eligibility stdout.",
        });

        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const record = createMockEligibilityRecord(address);

      console.log("[airdrop] records found", [record]);

      set({
        executionMode: "mock",
        isScanning: false,
        eligibilityRecords: [record],
        selectedEligibility: record,
      });
    } catch (error) {
      set({
        isScanning: false,
        scanError:
          error instanceof Error ? error.message : "Failed to scan records",
      });
    }
  },

  useMockEligibilityFallback: (address: string) => {
    const record = createMockEligibilityRecord(address);

    set({
      executionMode: "mock",
      scanError: null,
      claimError: null,
      claimErrorDetails: null,
      eligibilityRecords: [record],
      selectedEligibility: record,
      rawEligibilityRecord: null,
      issueTxId: null,
    });
  },

  selectEligibility: (recordId: string) => {
    const record = get().eligibilityRecords.find((item) => item.id === recordId);

    set({
      selectedEligibility: record ?? null,
    });
  },

  claimSelectedEligibility: async () => {
    const { selectedEligibility } = get();

    if (!selectedEligibility) {
      set({
        claimError: "Please select an Eligibility record first.",
        claimStatus: "failed",
      });
      return;
    }

    try {
      console.log("[airdrop] claim start", selectedEligibility);

      set({
        isClaiming: true,
        claimStatus: "preparing",
        claimError: null,
        claimErrorDetails: null,
        lastTxId: null,
      });

      if (ALEO_CONFIG.isDevnet && !selectedEligibility.isDevMock) {
        const rawEligibilityRecord = get().rawEligibilityRecord;

        if (!rawEligibilityRecord) {
          throw new Error(
            "Eligibility record parsing failed. Please inspect issue_eligibility stdout.",
          );
        }

        const result = await claimAirdropDevnet({
          eligibilityRecord: rawEligibilityRecord,
          currentTime: "1000u64",
        });

        if (!result.ok) {
          throw new Error(result.error ?? "Failed to claim airdrop");
        }

        const reward: RewardRecord = {
          id: `reward_${Date.now()}`,
          owner: selectedEligibility.owner,
          campaignId: selectedEligibility.campaignId,
          amount: selectedEligibility.amount,
          status: "unspent",
          txId: result.txId ?? undefined,
          rawRecord: result.rewardRecord ?? result.stdout,
          isDevnetRecord: true,
        };

        set((state) => ({
          executionMode: "devnet",
          rewards: [reward, ...state.rewards],
          selectedEligibility: null,
          eligibilityRecords: state.eligibilityRecords.filter(
            (item) => item.id !== selectedEligibility.id,
          ),
          isClaiming: false,
          claimStatus: "confirmed",
          lastTxId: result.txId ?? null,
          claimTxId: result.txId ?? null,
          rawRewardRecord: result.rewardRecord ?? result.stdout ?? null,
          claimError: result.rewardRecord
            ? null
            : "Reward record parsing failed. Claim succeeded; inspect claim_airdrop stdout.",
        }));

        await get().loadCampaign("1u64");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 700));

      set({
        claimStatus: "waiting_wallet",
      });

      await new Promise((resolve) => setTimeout(resolve, 900));

      const mockTxId = `mock_tx_${Date.now()}`;

      set({
        claimStatus: "submitted",
        lastTxId: mockTxId,
      });

      console.log("[airdrop] tx submitted", mockTxId);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const reward: RewardRecord = {
        id: `reward_${Date.now()}`,
        owner: selectedEligibility.owner,
        campaignId: selectedEligibility.campaignId,
        amount: selectedEligibility.amount,
        status: "unspent",
        txId: mockTxId,
        isDevMock: true,
      };

      console.log("[airdrop] tx confirmed", reward);

      set((state) => ({
        executionMode: "mock",
        rewards: [reward, ...state.rewards],
        selectedEligibility: null,
        eligibilityRecords: state.eligibilityRecords.filter(
          (item) => item.id !== selectedEligibility.id,
        ),
        isClaiming: false,
        claimStatus: "confirmed",
      }));
    } catch (error) {
      console.error("[airdrop] claim failed", error);

      set({
        isClaiming: false,
        claimStatus: "failed",
        claimError: error instanceof Error ? error.message : "Claim failed",
        claimErrorDetails: isDevnetApiError(error)
          ? [
              error.stdout ? `stdout:\n${error.stdout}` : "",
              error.stderr ? `stderr:\n${error.stderr}` : "",
            ]
              .filter(Boolean)
              .join("\n\n")
          : null,
      });
    }
  },

  executeClaimAirdrop: async () => {
    await get().claimSelectedEligibility();
  },

  resetClaimState: () => {
    set({
      claimStatus: "idle",
      claimError: null,
      claimErrorDetails: null,
      lastTxId: null,
    });
  },
}));
