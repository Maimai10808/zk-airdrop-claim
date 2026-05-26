import zk_airdrop_claim.aleo;

program test_zk_airdrop_claim.aleo {
     @noupgrade
    constructor() {}

    @test
    fn test_initialize_admin() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        return final {
            admin_final.run();
        };
    }

    @test
    fn test_issue_eligibility() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.caller;

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            1u64,
            2u8,
            1000u64,
        );

        assert_eq(eligibility.owner, user);
        assert_eq(eligibility.campaign_id, 1u64);
        assert_eq(eligibility.tier, 2u8);
        assert_eq(eligibility.amount, 1000u64);

        return final {
            admin_final.run();
            issue_final.run();
        };
    }

    @test
    fn test_claim_airdrop() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.caller;

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            1u64,
            2u8,
            1000u64,
        );

        let (reward, claim_final) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility,
        );

        assert_eq(reward.owner, user);
        assert_eq(reward.campaign_id, 1u64);
        assert_eq(reward.amount, 1000u64);

        return final {
            admin_final.run();
            issue_final.run();
            claim_final.run();
        };
    }

    @test
    fn test_split_reward() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.caller;

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            1u64,
            2u8,
            1000u64,
        );

        let (reward, claim_final) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility,
        );

        let (part_a, part_b) = zk_airdrop_claim.aleo::split_reward(
            reward,
            300u64,
        );

        assert_eq(part_a.owner, user);
        assert_eq(part_a.campaign_id, 1u64);
        assert_eq(part_a.amount, 300u64);

        assert_eq(part_b.owner, user);
        assert_eq(part_b.campaign_id, 1u64);
        assert_eq(part_b.amount, 700u64);

        return final {
            admin_final.run();
            issue_final.run();
            claim_final.run();
        };
    }

    @test
    fn test_merge_rewards() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.caller;

        let (eligibility_a, issue_final_a) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            1u64,
            2u8,
            300u64,
        );

        let (reward_a, claim_final_a) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility_a,
        );

        let (eligibility_b, issue_final_b) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            1u64,
            2u8,
            700u64,
        );

        let (reward_b, claim_final_b) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility_b,
        );

        let merged = zk_airdrop_claim.aleo::merge_rewards(
            reward_a,
            reward_b,
        );

        assert_eq(merged.owner, user);
        assert_eq(merged.campaign_id, 1u64);
        assert_eq(merged.amount, 1000u64);

        return final {
            admin_final.run();

            issue_final_a.run();
            claim_final_a.run();

            issue_final_b.run();
            claim_final_b.run();
        };
    }
}
