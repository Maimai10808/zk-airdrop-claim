// ============================================================================
// Test Suite for zk_airdrop_claim.aleo
// ============================================================================
//
// 本测试文件用于验证 ZK Airdrop Claim 合约的核心业务逻辑。
//
// 覆盖内容：
// 1. 初始化管理员
// 2. 创建 campaign 并签发 Eligibility
// 3. 用户正常领取 Reward
// 4. Reward 拆分
// 5. 同一用户领取多个不同 campaign
// 6. 重复领取失败
// 7. campaign 关闭后领取失败
// 8. 超过 deadline 后领取失败
// 9. 未初始化 admin 时不能创建 campaign
// 10. 未初始化 admin 时不能签发 Eligibility
//
// 注意：
// - @should_fail 表示该测试预期失败。
// - 如果函数内部真的失败了，测试反而会通过。
// - 这适合测试权限校验、过期校验、重复领取校验等安全逻辑。
// ============================================================================

import zk_airdrop_claim.aleo;

program test_zk_airdrop_claim.aleo {
    @noupgrade
    constructor() {}

    // =========================================================================
    // 1. Test Admin Initialization
    // =========================================================================
    //
    // 目的：
    // 验证 initialize_admin 可以正常执行。
    //
    // 预期：
    // - self.caller 被设置为 admin[0u8]
    // - final block 成功执行

    @test
    fn test_init_admin() -> Final {
        let admin_final = zk_airdrop_claim.aleo::initialize_admin();

        return final {
            admin_final.run();
        };
    }

    // =========================================================================
    // 2. Test Campaign Creation and Eligibility Issuance
    // =========================================================================
    //
    // 目的：
    // 验证管理员可以：
    // - 初始化 admin
    // - 创建 campaign
    // - 给用户签发 Eligibility private record
    //
    // 验证点：
    // - Eligibility.owner 正确
    // - Eligibility.campaign_id 正确
    // - Eligibility.tier 正确
    // - Eligibility.amount 正确
    // - Eligibility.deadline 正确

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

    // =========================================================================
    // 3. Test Normal Airdrop Claim
    // =========================================================================
    //
    // 目的：
    // 验证用户可以消耗 Eligibility，成功领取 Reward。
    //
    // 流程：
    // 1. 初始化 admin
    // 2. 创建 campaign
    // 3. 签发 Eligibility
    // 4. 用户调用 claim_airdrop
    //
    // 验证点：
    // - Reward.owner 是用户本人
    // - Reward.campaign_id 正确
    // - Reward.amount 正确
    //
    // 同时 final block 会更新：
    // - claimed[claim_key] = true
    // - campaign.total_claimed_users += 1
    // - campaign.total_claimed_amount += amount

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

    // =========================================================================
    // 4. Test Reward Split
    // =========================================================================
    //
    // 目的：
    // 验证 Reward 可以被拆成两个新的 Reward。
    //
    // 流程：
    // 1. 正常领取一个 1000 amount 的 Reward
    // 2. 调用 split_reward(reward, 300)
    //
    // 预期：
    // - part_a.amount = 300
    // - part_b.amount = 700
    // - 两个新 Reward 的 owner 和 campaign_id 保持一致

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

    // =========================================================================
    // 5. Test Multi-Campaign Claim
    // =========================================================================
    //
    // 目的：
    // 验证同一个用户可以领取不同 campaign 的奖励。
    //
    // 为什么需要这个测试？
    // 因为合约限制的是：
    //
    //     同一个 user + 同一个 campaign 只能领取一次
    //
    // 但同一个 user 领取不同 campaign 应该是允许的。
    //
    // 预期：
    // - 用户可以领取 campaign 1 的 300 reward
    // - 用户可以领取 campaign 2 的 700 reward

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

    // =========================================================================
    // 6. Test Double Claim Should Fail
    // =========================================================================
    //
    // 目的：
    // 验证 claimed mapping 能防止重复领取。
    //
    // 流程：
    // 1. 用户领取 campaign 1 第一次，成功。
    // 2. 管理员再次给同一个用户、同一个 campaign 签发 Eligibility。
    // 3. 用户尝试第二次 claim。
    //
    // 预期：
    // - 第二次 claim_final.run() 失败。
    //
    // 失败原因：
    // claimed[claim_key] 已经是 true。
    // claim_airdrop 中的 assert(!already_claimed) 会失败。

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

    // =========================================================================
    // 7. Test Claim Disabled Campaign Should Fail
    // =========================================================================
    //
    // 目的：
    // 验证 campaign 被关闭后不能领取。
    //
    // 流程：
    // 1. 创建 campaign
    // 2. 签发 Eligibility
    // 3. 管理员关闭 campaign
    // 4. 用户尝试 claim
    //
    // 预期：
    // - claim_final.run() 失败。
    //
    // 失败原因：
    // claim_airdrop final block 中的 assert(campaign.enabled) 失败。

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

    // =========================================================================
    // 8. Test Expired Claim Should Fail
    // =========================================================================
    //
    // 目的：
    // 验证超过 Eligibility deadline 后不能领取。
    //
    // 当前设置：
    // - campaign_deadline = 2000
    // - eligibility.deadline = 1800
    // - current_time = 1900
    //
    // 预期：
    // - claim_final.run() 失败。
    //
    // 失败原因：
    // claim_airdrop 中的 assert(current_time <= eligibility.deadline) 失败。

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

    // =========================================================================
    // 9. Test Create Campaign Without Admin Should Fail
    // =========================================================================
    //
    // 目的：
    // 验证 admin 未初始化时不能创建 campaign。
    //
    // 预期：
    // - campaign_final.run() 失败。
    //
    // 失败原因：
    // create_campaign final block 中调用 admin.get(0u8)，
    // 但 admin 尚未设置，所以会失败。

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

    // =========================================================================
    // 10. Test Issue Eligibility Without Admin Should Fail
    // =========================================================================
    //
    // 目的：
    // 验证 admin 未初始化时不能签发 Eligibility。
    //
    // 预期：
    // - issue_final.run() 失败。
    //
    // 失败原因：
    // issue_eligibility final block 中调用 admin.get(0u8)，
    // 但 admin 尚未初始化，所以会失败。

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
