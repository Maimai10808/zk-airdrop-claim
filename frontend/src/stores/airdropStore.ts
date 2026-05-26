import { create } from "zustand";

import { getCampaign, type CampaignState } from "@/services/aleoRestClient";

export type EligibilityRecord = {
  id: string;
  owner: string;
  campaignId: string;
  tier: string;
  amount: string;
  deadline: string;
  plaintext?: string;
  ciphertext?: string;
  isDevMock?: boolean;
};

export type RewardRecord = {
  id: string;
  owner: string;
  campaignId: string;
  amount: string;
  status: "unspent" | "spent";
  txId?: string;
  isDevMock?: boolean;
};

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

  eligibilityRecords: EligibilityRecord[];
  selectedEligibility: EligibilityRecord | null;
  rewards: RewardRecord[];

  isLoadingCampaign: boolean;
  isScanning: boolean;
  isClaiming: boolean;

  scanError: string | null;
  claimError: string | null;
  campaignError: string | null;

  lastTxId: string | null;
  claimStatus: ClaimStatus;

  loadCampaign: (campaignId?: string) => Promise<void>;
  scanEligibility: (address: string, campaignId?: string) => Promise<void>;
  selectEligibility: (recordId: string) => void;
  claimSelectedEligibility: () => Promise<void>;
  resetClaimState: () => void;
};

export const useAirdropStore = create<AirdropState>((set, get) => ({
  campaign: null,
  campaignId: "1u64",

  eligibilityRecords: [],
  selectedEligibility: null,
  rewards: [],

  isLoadingCampaign: false,
  isScanning: false,
  isClaiming: false,

  scanError: null,
  claimError: null,
  campaignError: null,

  lastTxId: null,
  claimStatus: "idle",

  loadCampaign: async (campaignId = "1u64") => {
    try {
      set({
        isLoadingCampaign: true,
        campaignError: null,
        campaignId,
      });

      const campaign = await getCampaign(campaignId);

      set({
        campaign:
          campaign ??
          ({
            enabled: true,
            deadline: "2000u64",
            totalClaimedUsers: "0u64",
            totalClaimedAmount: "0u64",
          } satisfies CampaignState),
        isLoadingCampaign: false,
      });
    } catch (error) {
      set({
        isLoadingCampaign: false,
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
      });

      console.log("[airdrop] scan start", { address, campaignId });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const record: EligibilityRecord = {
        id: `eligibility_${Date.now()}`,
        owner: address,
        campaignId,
        tier: "2u8",
        amount: "1000u64",
        deadline: "1800u64",
        plaintext:
          "{ owner: " +
          address +
          ", campaign_id: 1u64, tier: 2u8, amount: 1000u64, deadline: 1800u64 }",
        isDevMock: true,
      };

      console.log("[airdrop] records found", [record]);

      set({
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
        lastTxId: null,
      });

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
      });
    }
  },

  resetClaimState: () => {
    set({
      claimStatus: "idle",
      claimError: null,
      lastTxId: null,
    });
  },
}));
