// ============================================================================
// ZK Airdrop Claim
// ============================================================================
//
// 这是一个基于 Aleo / Leo 的隐私空投领取合约。
//
// 核心设计：
// 1. 管理员创建空投活动 campaign。
// 2. 管理员给用户签发 Eligibility private record。
// 3. 用户消耗 Eligibility record，领取 Reward private record。
// 4. 用户的资格等级 tier、奖励金额 amount、领取凭证都不会以明文暴露。
// 5. 合约通过 public mapping 记录 campaign 状态、领取人数、发放总额和防重复领取状态。
//
// 隐私与公开状态的边界：
// - Eligibility / Reward 是 private record，属于用户私有状态。
// - admin / campaigns / claimed 是 public mapping，属于链上公开状态。
// - 单个用户领取了多少是私有的。
// - 某个 campaign 总共领取了多少人、总共发了多少额度是公开的。
// ============================================================================


// ============================================================================
// Helper Function
// ============================================================================
//
// build_claim_key 用于生成 claimed mapping 的 key。
// 目的是实现：同一个 user 在同一个 campaign 下只能领取一次。
//
// 当前 MVP 写法：
// claim_key = user as field + campaign_id as field
//
// 这适合 demo 和本地测试。
// 如果后面要做更正式的版本，可以换成更规范的哈希形式，
// 例如 Poseidon(user, campaign_id)，避免简单相加带来的理论碰撞风险。

fn build_claim_key(
    user: address,
    campaign_id: u64,
) -> field {
    let user_key: field = user as field;
    let campaign_key: field = campaign_id as field;
    return user_key + campaign_key;
}


// ============================================================================
// Main Program
// ============================================================================

program zk_airdrop_claim.aleo {
    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    //
    // @noupgrade 表示该程序部署后不可升级。
    // 这样可以表达“规则固定、不能被管理员随意改逻辑”。

    @noupgrade
    constructor() {}


    // =========================================================================
    // Structs
    // =========================================================================

    // -------------------------------------------------------------------------
    // Campaign
    // -------------------------------------------------------------------------
    //
    // Campaign 是一个公开结构体，用于存储某个空投活动的公开配置和统计数据。
    //
    // enabled:
    //     该活动是否开启。关闭后不能领取。
    //
    // deadline:
    //     活动最终过期时间。claim 时传入的 current_time 必须不超过该值。
    //
    // total_claimed_users:
    //     已成功领取的人数统计。
    //
    // total_claimed_amount:
    //     已发放的总额度统计。
    //
    // 注意：
    //     单个用户的具体 tier 和 amount 仍然在 private record 中。
    //     这里只记录聚合统计，方便前端展示 campaign 状态。

    struct Campaign {
        enabled: bool,
        deadline: u64,
        total_claimed_users: u64,
        total_claimed_amount: u64,
    }


    // =========================================================================
    // Private Records
    // =========================================================================

    // -------------------------------------------------------------------------
    // Eligibility
    // -------------------------------------------------------------------------
    //
    // Eligibility 是管理员签发给用户的“空投资格凭证”。
    //
    // 它是 private record，所以链上不会明文暴露：
    // - 谁拿到了资格
    // - 属于哪个 tier
    // - 可以领取多少 amount
    // - 这个资格什么时候过期
    //
    // 生命周期：
    // 1. issue_eligibility 创建 Eligibility。
    // 2. claim_airdrop 消耗 Eligibility。
    // 3. 消耗后生成 Reward。
    //
    // 字段说明：
    // owner:
    //     资格拥有者，只有该 owner 可以领取。
    //
    // campaign_id:
    //     对应的活动 ID。
    //
    // tier:
    //     用户等级，例如 1 / 2 / 3，不同等级可以对应不同奖励。
    //
    // amount:
    //     可领取奖励数量。
    //
    // deadline:
    //     该资格自己的过期时间，必须小于等于 campaign 的 deadline。

    record Eligibility {
        owner: address,
        campaign_id: u64,
        tier: u8,
        amount: u64,
        deadline: u64,
    }

    // -------------------------------------------------------------------------
    // Reward
    // -------------------------------------------------------------------------
    //
    // Reward 是用户成功领取后获得的私有奖励记录。
    //
    // 它也是 private record，所以外界无法直接看到：
    // - 谁拿到了 reward
    // - 具体 amount 是多少
    //
    // 后续可以扩展：
    // - redeem_reward：把 Reward 兑换成某种积分 / token
    // - private transfer：把 Reward 私下转给别人
    // - burn_reward：销毁 Reward 兑换权益

    record Reward {
        owner: address,
        campaign_id: u64,
        amount: u64,
    }


    // =========================================================================
    // Public State
    // =========================================================================

    // -------------------------------------------------------------------------
    // admin
    // -------------------------------------------------------------------------
    //
    // 管理员地址。
    //
    // 使用方式：
    // admin[0u8] = admin address
    //
    // 为什么用 mapping？
    // 因为 Leo 里链上可变公开状态需要放在 mapping 里，
    // 并且只能在 final block 中修改。

    mapping admin: u8 => address;

    // -------------------------------------------------------------------------
    // campaigns
    // -------------------------------------------------------------------------
    //
    // campaign_id => Campaign
    //
    // 存储所有空投活动的公开状态，包括：
    // - 是否启用
    // - 截止时间
    // - 已领取人数
    // - 已发放额度

    mapping campaigns: u64 => Campaign;

    // -------------------------------------------------------------------------
    // claimed
    // -------------------------------------------------------------------------
    //
    // claim_key => bool
    //
    // 用于防止重复领取。
    //
    // claim_key 由 user + campaign_id 计算得到。
    // 当用户成功领取后：
    // claimed[claim_key] = true
    //
    // 下次同一个 user 想领取同一个 campaign，会触发 assert 失败。

    mapping claimed: field => bool;


    // =========================================================================
    // Admin Setup
    // =========================================================================

    // -------------------------------------------------------------------------
    // initialize_admin
    // -------------------------------------------------------------------------
    //
    // 初始化管理员。
    //
    // 规则：
    // - 只能调用一次。
    // - 第一次调用的人会成为管理员。
    //
    // 链上状态变化：
    // - admin[0u8] = self.caller
    //
    // 为什么返回 Final？
    // 因为 admin 是 public mapping，只能在 final block 里写入。

    fn initialize_admin() -> Final {
        let caller: address = self.caller;

        return final {
            let exists: bool = admin.contains(0u8);
            assert(!exists);

            admin.set(0u8, caller);
        };
    }

    // -------------------------------------------------------------------------
    // transfer_admin
    // -------------------------------------------------------------------------
    //
    // 转移管理员权限。
    //
    // 规则：
    // - 只有当前管理员可以调用。
    //
    // 链上状态变化：
    // - admin[0u8] = new_admin

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

    // -------------------------------------------------------------------------
    // create_campaign
    // -------------------------------------------------------------------------
    //
    // 创建一个新的空投活动。
    //
    // 参数：
    // campaign_id:
    //     活动 ID。必须唯一。
    //
    // deadline:
    //     活动截止时间。
    //
    // 规则：
    // - 只有 admin 可以创建。
    // - campaign_id 不能重复。
    // - 新 campaign 默认 enabled = true。
    //
    // 链上状态变化：
    // - campaigns[campaign_id] = Campaign(...)

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

    // -------------------------------------------------------------------------
    // set_campaign_enabled
    // -------------------------------------------------------------------------
    //
    // 开启或关闭某个 campaign。
    //
    // 规则：
    // - 只有 admin 可以调用。
    // - campaign 关闭后，claim_airdrop 会失败。
    //
    // 链上状态变化：
    // - 更新 campaigns[campaign_id].enabled
    //
    // 注意：
    // Leo struct 不能只修改一个字段，所以这里重新构造 Campaign。

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

    // -------------------------------------------------------------------------
    // set_campaign_deadline
    // -------------------------------------------------------------------------
    //
    // 修改 campaign 的截止时间。
    //
    // 规则：
    // - 只有 admin 可以调用。
    //
    // 链上状态变化：
    // - 更新 campaigns[campaign_id].deadline

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

    // -------------------------------------------------------------------------
    // issue_eligibility
    // -------------------------------------------------------------------------
    //
    // 管理员给用户签发空投资格。
    //
    // 参数：
    // receiver:
    //     接收 Eligibility 的用户地址。
    //
    // campaign_id:
    //     对应的 campaign。
    //
    // tier:
    //     用户等级。必须 > 0。
    //
    // amount:
    //     用户可领取数量。必须 > 0。
    //
    // deadline:
    //     该资格的过期时间，必须 <= campaign.deadline。
    //
    // 返回：
    // - Eligibility private record
    // - Final，用于在链上验证 admin 权限和 campaign 状态
    //
    // 隐私点：
    // - receiver、tier、amount、deadline 都进入 private record。
    // - 链上只验证这个签发动作合法，不公开资格细节。

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

    // -------------------------------------------------------------------------
    // claim_airdrop
    // -------------------------------------------------------------------------
    //
    // 用户消耗 Eligibility，领取 Reward。
    //
    // 参数：
    // eligibility:
    //     用户持有的 private Eligibility record。
    //
    // current_time:
    //     当前时间。这里作为 public 参数传入。
    //     demo 阶段可以由前端传入，后续可以根据更规范的时间源设计。
    //
    // 规则：
    // - 交易签名者必须是 eligibility.owner。
    // - eligibility.amount 必须 > 0。
    // - eligibility.tier 必须 > 0。
    // - current_time 不能超过 eligibility.deadline。
    // - campaign 必须 enabled。
    // - current_time 不能超过 campaign.deadline。
    // - 同一个 user + campaign 不能重复领取。
    //
    // 返回：
    // - Reward private record
    // - Final，用于更新 public mapping
    //
    // 链上状态变化：
    // - claimed[claim_key] = true
    // - campaigns[campaign_id].total_claimed_users += 1
    // - campaigns[campaign_id].total_claimed_amount += amount

    fn claim_airdrop(
        eligibility: Eligibility,
        public current_time: u64,
    ) -> (Reward, Final) {
        assert_eq(self.signer, eligibility.owner);
        assert(eligibility.amount > 0u64);
        assert(eligibility.tier > 0u8);
        assert(current_time <= eligibility.deadline);

        // record 变量不能直接在 final block 中使用。
        // 所以需要先把 final 需要的数据提取成普通变量。
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
    // Reward Utilities
    // =========================================================================

    // -------------------------------------------------------------------------
    // split_reward
    // -------------------------------------------------------------------------
    //
    // 将一个 Reward 拆成两个 Reward。
    //
    // 类似 UTXO 找零模型：
    // - 输入 reward 会被消费。
    // - 输出 part_a 和 part_b 是两个新的 Reward record。
    //
    // 规则：
    // - 交易签名者必须是 reward.owner。
    // - amount 必须 > 0。
    // - reward.amount 必须 >= amount。
    //
    // 用途：
    // - 后续可以让用户把奖励拆分成不同份额，用于转账、兑换或消费。

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

    // -------------------------------------------------------------------------
    // merge_rewards
    // -------------------------------------------------------------------------
    //
    // 合并两个 Reward。
    //
    // 规则：
    // - 两个 Reward 都必须属于当前 signer。
    // - 两个 Reward 的 owner 必须相同。
    // - 两个 Reward 必须来自同一个 campaign。
    //
    // 用途：
    // - 用户可能有多个碎片化 Reward record，可以合并成一个更大的记录。
    //
    // 注意：
    // 因为当前 claim 逻辑限制同一 user + campaign 只能领取一次，
    // 所以 merge_rewards 更适合后续扩展场景：
    // - reward transfer 后合并
    // - 管理员特殊补发
    // - 多个来源产生同 campaign reward

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
