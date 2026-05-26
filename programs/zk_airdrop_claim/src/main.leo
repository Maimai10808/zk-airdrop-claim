fn build_claim_key(
    user: address,
    campaign_id: u64,
) -> field {
    let user_key: field = user as field;
    let campaign_key: field = campaign_id as field;
    return user_key + campaign_key;
}

program zk_airdrop_claim.aleo {
    @noupgrade
    constructor() {}

    // =========================================================================
    // Structs
    // =========================================================================

    struct Campaign {
        enabled: bool,
        deadline: u64,
        total_claimed_users: u64,
        total_claimed_amount: u64,
    }

    // =========================================================================
    // Private Records
    // =========================================================================

    record Eligibility {
        owner: address,
        campaign_id: u64,
        tier: u8,
        amount: u64,
        deadline: u64,
    }

    record Reward {
        owner: address,
        campaign_id: u64,
        amount: u64,
    }

    // =========================================================================
    // Public State
    // =========================================================================

    mapping admin: u8 => address;
    mapping campaigns: u64 => Campaign;
    mapping claimed: field => bool;

    // =========================================================================
    // Admin Setup
    // =========================================================================

    fn initialize_admin() -> Final {
        let caller: address = self.caller;

        return final {
            let exists: bool = admin.contains(0u8);
            assert(!exists);

            admin.set(0u8, caller);
        };
    }

    fn transfer_admin(
        public new_admin: address,
    ) -> Final {
        let caller: address = self.caller;

        return final {
            let current_admin: address = admin.get(0u8);
            assert_eq(caller, current_admin);

            admin.set(0u8, new_admin);
        };
    }

    // =========================================================================
    // Campaign Management
    // =========================================================================

    fn create_campaign(
        public campaign_id: u64,
        public deadline: u64,
    ) -> Final {
        let caller: address = self.caller;

        return final {
            let current_admin: address = admin.get(0u8);
            assert_eq(caller, current_admin);

            let exists: bool = campaigns.contains(campaign_id);
            assert(!exists);

            let campaign: Campaign = Campaign {
                enabled: true,
                deadline: deadline,
                total_claimed_users: 0u64,
                total_claimed_amount: 0u64,
            };

            campaigns.set(campaign_id, campaign);
        };
    }

    fn set_campaign_enabled(
        public campaign_id: u64,
        public enabled: bool,
    ) -> Final {
        let caller: address = self.caller;

        return final {
            let current_admin: address = admin.get(0u8);
            assert_eq(caller, current_admin);

            let old_campaign: Campaign = campaigns.get(campaign_id);

            let new_campaign: Campaign = Campaign {
                enabled: enabled,
                deadline: old_campaign.deadline,
                total_claimed_users: old_campaign.total_claimed_users,
                total_claimed_amount: old_campaign.total_claimed_amount,
            };

            campaigns.set(campaign_id, new_campaign);
        };
    }

    fn set_campaign_deadline(
        public campaign_id: u64,
        public new_deadline: u64,
    ) -> Final {
        let caller: address = self.caller;

        return final {
            let current_admin: address = admin.get(0u8);
            assert_eq(caller, current_admin);

            let old_campaign: Campaign = campaigns.get(campaign_id);

            let new_campaign: Campaign = Campaign {
                enabled: old_campaign.enabled,
                deadline: new_deadline,
                total_claimed_users: old_campaign.total_claimed_users,
                total_claimed_amount: old_campaign.total_claimed_amount,
            };

            campaigns.set(campaign_id, new_campaign);
        };
    }

    // =========================================================================
    // Issue Eligibility
    // =========================================================================

    fn issue_eligibility(
        receiver: address,
        campaign_id: u64,
        tier: u8,
        amount: u64,
        deadline: u64,
    ) -> (Eligibility, Final) {
        let caller: address = self.caller;

        assert(amount > 0u64);
        assert(tier > 0u8);

        let eligibility: Eligibility = Eligibility {
            owner: receiver,
            campaign_id: campaign_id,
            tier: tier,
            amount: amount,
            deadline: deadline,
        };

        return (eligibility, final {
            let current_admin: address = admin.get(0u8);
            assert_eq(caller, current_admin);

            let campaign: Campaign = campaigns.get(campaign_id);
            assert(campaign.enabled);
            assert(deadline <= campaign.deadline);
        });
    }

    // =========================================================================
    // Claim Airdrop
    // =========================================================================

    fn claim_airdrop(
        eligibility: Eligibility,
        public current_time: u64,
    ) -> (Reward, Final) {
        assert_eq(self.signer, eligibility.owner);
        assert(eligibility.amount > 0u64);
        assert(eligibility.tier > 0u8);
        assert(current_time <= eligibility.deadline);

        let claim_campaign_id: u64 = eligibility.campaign_id;
        let claim_amount: u64 = eligibility.amount;
        let claim_key: field = build_claim_key(
            self.signer,
            eligibility.campaign_id,
        );

        let reward: Reward = Reward {
            owner: eligibility.owner,
            campaign_id: eligibility.campaign_id,
            amount: eligibility.amount,
        };

        return (reward, final {
            let campaign: Campaign = campaigns.get(claim_campaign_id);

            assert(campaign.enabled);
            assert(current_time <= campaign.deadline);

            let already_claimed: bool = claimed.get_or_use(claim_key, false);
            assert(!already_claimed);

            claimed.set(claim_key, true);

            let updated_campaign: Campaign = Campaign {
                enabled: campaign.enabled,
                deadline: campaign.deadline,
                total_claimed_users: campaign.total_claimed_users + 1u64,
                total_claimed_amount: campaign.total_claimed_amount + claim_amount,
            };

            campaigns.set(claim_campaign_id, updated_campaign);
        });
    }

    // =========================================================================
    // Split Reward
    // =========================================================================

    fn split_reward(
        reward: Reward,
        amount: u64,
    ) -> (Reward, Reward) {
        assert_eq(self.signer, reward.owner);
        assert(amount > 0u64);
        assert(reward.amount >= amount);

        let part_a: Reward = Reward {
            owner: reward.owner,
            campaign_id: reward.campaign_id,
            amount: amount,
        };

        let part_b: Reward = Reward {
            owner: reward.owner,
            campaign_id: reward.campaign_id,
            amount: reward.amount - amount,
        };

        return (part_a, part_b);
    }

    // =========================================================================
    // Merge Rewards
    // =========================================================================

    fn merge_rewards(
        reward_a: Reward,
        reward_b: Reward,
    ) -> Reward {
        assert_eq(self.signer, reward_a.owner);
        assert_eq(self.signer, reward_b.owner);
        assert_eq(reward_a.owner, reward_b.owner);
        assert_eq(reward_a.campaign_id, reward_b.campaign_id);

        let merged: Reward = Reward {
            owner: reward_a.owner,
            campaign_id: reward_a.campaign_id,
            amount: reward_a.amount + reward_b.amount,
        };

        return merged;
    }
}
