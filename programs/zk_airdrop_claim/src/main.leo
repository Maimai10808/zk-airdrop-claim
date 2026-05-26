program zk_airdrop_claim.aleo {
    @noupgrade
    constructor() {}

    // =========================================================================
    // Private Records
    // =========================================================================

    record Eligibility {
        owner: address,
        campaign_id: u64,
        tier: u8,
        amount: u64,
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
    mapping campaign_claim_count: u64 => u64;

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

    // =========================================================================
    // Issue Eligibility
    // =========================================================================

    fn issue_eligibility(
        receiver: address,
        campaign_id: u64,
        tier: u8,
        amount: u64,
    ) -> (Eligibility, Final) {
        let caller: address = self.caller;

        assert(amount > 0u64);
        assert(tier > 0u8);

        let eligibility: Eligibility = Eligibility {
            owner: receiver,
            campaign_id: campaign_id,
            tier: tier,
            amount: amount,
        };

        return (eligibility, final {
            let current_admin: address = admin.get(0u8);
            assert_eq(caller, current_admin);
        });
    }

    // =========================================================================
    // Claim Airdrop
    // =========================================================================

    fn claim_airdrop(
        eligibility: Eligibility,
    ) -> (Reward, Final) {
        // 用 self.signer 校验原始交易签名者。
        // 这样即使通过测试 program / router program 间接调用，也能识别真正用户。
        assert_eq(self.signer, eligibility.owner);
        assert(eligibility.amount > 0u64);
        assert(eligibility.tier > 0u8);

        // record 不能直接进入 final block。
        // 所以先把 final 需要用的 campaign_id 提取出来。
        let claim_campaign_id: u64 = eligibility.campaign_id;

        let reward: Reward = Reward {
            owner: eligibility.owner,
            campaign_id: eligibility.campaign_id,
            amount: eligibility.amount,
        };

        return (reward, final {
            let current_count: u64 = campaign_claim_count.get_or_use(
                claim_campaign_id,
                0u64,
            );

            campaign_claim_count.set(
                claim_campaign_id,
                current_count + 1u64,
            );
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
