import zk_airdrop_claim.aleo;

program test_zk_airdrop_claim.aleo {
    @noupgrade
    constructor() {}

    @test
    fn test_init_admin() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        return final {
            admin_final.run();
        };
    }

    @test
    fn test_issue_campaign() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let campaign_id: u64 = 1u64;
        let campaign_deadline: u64 = 2000u64;
        let user: address = self.signer;

        let campaign_final = zk_airdrop_claim.aleo::create_campaign(
            campaign_id,
            campaign_deadline,
        );

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            2u8,
            1000u64,
            1800u64,
        );

        assert_eq(eligibility.owner, user);
        assert_eq(eligibility.campaign_id, campaign_id);
        assert_eq(eligibility.tier, 2u8);
        assert_eq(eligibility.amount, 1000u64);
        assert_eq(eligibility.deadline, 1800u64);

        return final {
            admin_final.run();
            campaign_final.run();
            issue_final.run();
        };
    }

    @test
    fn test_claim() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let campaign_id: u64 = 1u64;
        let campaign_deadline: u64 = 2000u64;
        let user: address = self.signer;

        let campaign_final = zk_airdrop_claim.aleo::create_campaign(
            campaign_id,
            campaign_deadline,
        );

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            2u8,
            1000u64,
            1800u64,
        );

        let (reward, claim_final) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility,
            1000u64,
        );

        assert_eq(reward.owner, user);
        assert_eq(reward.campaign_id, campaign_id);
        assert_eq(reward.amount, 1000u64);

        return final {
            admin_final.run();
            campaign_final.run();
            issue_final.run();
            claim_final.run();
        };
    }

    @test
    fn test_split() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let campaign_id: u64 = 1u64;
        let campaign_deadline: u64 = 2000u64;
        let user: address = self.signer;

        let campaign_final = zk_airdrop_claim.aleo::create_campaign(
            campaign_id,
            campaign_deadline,
        );

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            2u8,
            1000u64,
            1800u64,
        );

        let (reward, claim_final) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility,
            1000u64,
        );

        let (part_a, part_b) = zk_airdrop_claim.aleo::split_reward(
            reward,
            300u64,
        );

        assert_eq(part_a.owner, user);
        assert_eq(part_a.campaign_id, campaign_id);
        assert_eq(part_a.amount, 300u64);

        assert_eq(part_b.owner, user);
        assert_eq(part_b.campaign_id, campaign_id);
        assert_eq(part_b.amount, 700u64);

        return final {
            admin_final.run();
            campaign_final.run();
            issue_final.run();
            claim_final.run();
        };
    }

    @test
    fn test_multi_campaign() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.signer;

        let campaign_id_a: u64 = 1u64;
        let campaign_id_b: u64 = 2u64;
        let campaign_deadline: u64 = 2000u64;

        let campaign_final_a = zk_airdrop_claim.aleo::create_campaign(
            campaign_id_a,
            campaign_deadline,
        );

        let campaign_final_b = zk_airdrop_claim.aleo::create_campaign(
            campaign_id_b,
            campaign_deadline,
        );

        let (eligibility_a, issue_final_a) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id_a,
            2u8,
            300u64,
            1800u64,
        );

        let (reward_a, claim_final_a) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility_a,
            1000u64,
        );

        let (eligibility_b, issue_final_b) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id_b,
            3u8,
            700u64,
            1800u64,
        );

        let (reward_b, claim_final_b) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility_b,
            1000u64,
        );

        assert_eq(reward_a.owner, user);
        assert_eq(reward_a.campaign_id, campaign_id_a);
        assert_eq(reward_a.amount, 300u64);

        assert_eq(reward_b.owner, user);
        assert_eq(reward_b.campaign_id, campaign_id_b);
        assert_eq(reward_b.amount, 700u64);

        return final {
            admin_final.run();

            campaign_final_a.run();
            campaign_final_b.run();

            issue_final_a.run();
            claim_final_a.run();

            issue_final_b.run();
            claim_final_b.run();
        };
    }

    @test
    @should_fail
    fn test_double_claim_fail() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.signer;

        let campaign_id: u64 = 1u64;
        let campaign_deadline: u64 = 2000u64;

        let campaign_final = zk_airdrop_claim.aleo::create_campaign(
            campaign_id,
            campaign_deadline,
        );

        let (eligibility_a, issue_final_a) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            2u8,
            1000u64,
            1800u64,
        );

        let (reward_a, claim_final_a) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility_a,
            1000u64,
        );

        assert_eq(reward_a.owner, user);
        assert_eq(reward_a.campaign_id, campaign_id);
        assert_eq(reward_a.amount, 1000u64);

        let (eligibility_b, issue_final_b) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            3u8,
            2000u64,
            1800u64,
        );

        let (reward_b, claim_final_b) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility_b,
            1000u64,
        );

        assert_eq(reward_b.owner, user);
        assert_eq(reward_b.campaign_id, campaign_id);
        assert_eq(reward_b.amount, 2000u64);

        return final {
            admin_final.run();
            campaign_final.run();

            issue_final_a.run();
            claim_final_a.run();

            issue_final_b.run();

            // 第二次领取同一个 user + campaign，应该失败。
            claim_final_b.run();
        };
    }

    @test
    @should_fail
    fn test_claim_disabled_fail() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.signer;
        let campaign_id: u64 = 1u64;
        let campaign_deadline: u64 = 2000u64;

        let campaign_final = zk_airdrop_claim.aleo::create_campaign(
            campaign_id,
            campaign_deadline,
        );

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            2u8,
            1000u64,
            1800u64,
        );

        let disable_final = zk_airdrop_claim.aleo::set_campaign_enabled(
            campaign_id,
            false,
        );

        let (reward, claim_final) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility,
            1000u64,
        );

        assert_eq(reward.owner, user);
        assert_eq(reward.amount, 1000u64);

        return final {
            admin_final.run();
            campaign_final.run();
            issue_final.run();

            disable_final.run();

            // campaign 已关闭，这里应该失败。
            claim_final.run();
        };
    }

    @test
    @should_fail
    fn test_claim_expired_fail() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        let user: address = self.signer;
        let campaign_id: u64 = 1u64;
        let campaign_deadline: u64 = 2000u64;

        let campaign_final = zk_airdrop_claim.aleo::create_campaign(
            campaign_id,
            campaign_deadline,
        );

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            2u8,
            1000u64,
            1800u64,
        );

        let (reward, claim_final) = zk_airdrop_claim.aleo::claim_airdrop(
            eligibility,
            1900u64,
        );

        assert_eq(reward.owner, user);
        assert_eq(reward.amount, 1000u64);

        return final {
            admin_final.run();
            campaign_final.run();
            issue_final.run();

            // current_time = 1900，超过 eligibility.deadline = 1800，应该失败。
            claim_final.run();
        };
    }

    @test
    @should_fail
    fn test_create_no_admin_fail() -> Final {
        let campaign_id: u64 = 1u64;
        let campaign_deadline: u64 = 2000u64;

        let campaign_final = zk_airdrop_claim.aleo::create_campaign(
            campaign_id,
            campaign_deadline,
        );

        return final {
            // admin 尚未初始化，这里应该失败。
            campaign_final.run();
        };
    }

    @test
    @should_fail
    fn test_issue_no_admin_fail() -> Final {
        let user: address = self.signer;
        let campaign_id: u64 = 1u64;

        let (eligibility, issue_final) = zk_airdrop_claim.aleo::issue_eligibility(
            user,
            campaign_id,
            2u8,
            1000u64,
            1800u64,
        );

        assert_eq(eligibility.owner, user);
        assert_eq(eligibility.amount, 1000u64);

        return final {
            // admin 尚未初始化，这里应该失败。
            issue_final.run();
        };
    }
}
