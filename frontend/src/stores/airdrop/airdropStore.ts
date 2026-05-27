import { create } from "zustand";

import type { AirdropState } from "@/types/airdrop";

import { createAccountActions } from "./accountActions";
import { createCampaignActions } from "./campaignActions";
import { createClaimActions } from "./claimActions";
import { createClaimStatusActions } from "./claimStatusActions";
import { createEligibilityActions } from "./eligibilityActions";
import { initialAirdropState } from "./initialState";
import { createTaskActions } from "./taskActions";

export const useAirdropStore = create<AirdropState>((set, get) => ({
  ...initialAirdropState,
  ...createCampaignActions(set, get),
  ...createAccountActions(set, get),
  ...createClaimStatusActions(set, get),
  ...createTaskActions(set, get),
  ...createEligibilityActions(set, get),
  ...createClaimActions(set, get),
}));
