import { ALEO_CONFIG } from "@/config/aleo";
import { DEFAULT_CAMPAIGN_ID } from "@/constants/airdrop";
import { getCampaign } from "@/services/aleoRestClient";

import type { AirdropGet, AirdropSet } from "./types";

export function createCampaignActions(set: AirdropSet, get: AirdropGet) {
  return {
    /**
     * 从 Aleo mapping 加载 campaign 状态。
     *
     * 实际读取的是：
     *   campaigns[campaignId]
     */
    loadCampaign: async (campaignId = DEFAULT_CAMPAIGN_ID) => {
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

        if (ALEO_CONFIG.isDevnet) {
          await get().loadSelectedAccountClaimStatus(campaignId);
        }
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
  };
}
