const isDevnet = process.env.NEXT_PUBLIC_ALEO_DEVNET === "true";

export const ALEO_CONFIG = {
  network: process.env.NEXT_PUBLIC_ALEO_NETWORK ?? "testnet",
  walletNetwork: process.env.NEXT_PUBLIC_ALEO_WALLET_NETWORK ?? "testnet",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_ALEO_API_BASE_URL ??
    (isDevnet ? "http://localhost:3030" : "https://api.provable.com/v2"),
  programId: process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID ?? "zk_airdrop_claim.aleo",
  isDevnet,
  explorerBaseUrl: "https://explorer.provable.com",
  devnetAdminAddress:
    "aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px",

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
