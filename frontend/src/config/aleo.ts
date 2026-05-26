export const ALEO_CONFIG = {
  network: "testnet",
  walletNetwork: "testnet3",

  apiBaseUrl: "https://api.provable.com/v2",

  programId:
    process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID ?? "zk_airdrop_claim.aleo",

  explorerBaseUrl: "https://explorer.provable.com",

  functions: {
    initializeAdmin: "initialize_admin",
    transferAdmin: "transfer_admin",
    createCampaign: "create_campaign",
    setCampaignEnabled: "set_campaign_enabled",
    setCampaignDeadline: "set_campaign_deadline",
    issueEligibility: "issue_eligibility",
    claimAirdrop: "claim_airdrop",
    splitReward: "split_reward",
    mergeRewards: "merge_rewards",
  },

  mappings: {
    admin: "admin",
    campaigns: "campaigns",
    claimed: "claimed",
  },
} as const;
