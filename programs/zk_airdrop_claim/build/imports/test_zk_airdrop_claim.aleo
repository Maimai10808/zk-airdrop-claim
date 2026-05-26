import zk_airdrop_claim.aleo;
program test_zk_airdrop_claim.aleo;

function test_initialize_admin:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    async test_initialize_admin r0 into r1;
    output r1 as test_zk_airdrop_claim.aleo/test_initialize_admin.future;

finalize test_initialize_admin:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    await r0;

function test_issue_eligibility:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/issue_eligibility self.caller 1u64 2u8 1000u64 into r1 r2;
    assert.eq r1.owner self.caller;
    assert.eq r1.campaign_id 1u64;
    assert.eq r1.tier 2u8;
    assert.eq r1.amount 1000u64;
    async test_issue_eligibility r0 r2 into r3;
    output r3 as test_zk_airdrop_claim.aleo/test_issue_eligibility.future;

finalize test_issue_eligibility:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/issue_eligibility.future;
    await r0;
    await r1;

function test_claim_airdrop:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/issue_eligibility self.caller 1u64 2u8 1000u64 into r1 r2;
    call zk_airdrop_claim.aleo/claim_airdrop r1 into r3 r4;
    assert.eq r3.owner self.caller;
    assert.eq r3.campaign_id 1u64;
    assert.eq r3.amount 1000u64;
    async test_claim_airdrop r0 r2 r4 into r5;
    output r5 as test_zk_airdrop_claim.aleo/test_claim_airdrop.future;

finalize test_claim_airdrop:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r2 as zk_airdrop_claim.aleo/claim_airdrop.future;
    await r0;
    await r1;
    await r2;

function test_split_reward:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/issue_eligibility self.caller 1u64 2u8 1000u64 into r1 r2;
    call zk_airdrop_claim.aleo/claim_airdrop r1 into r3 r4;
    call zk_airdrop_claim.aleo/split_reward r3 300u64 into r5 r6;
    assert.eq r5.owner self.caller;
    assert.eq r5.campaign_id 1u64;
    assert.eq r5.amount 300u64;
    assert.eq r6.owner self.caller;
    assert.eq r6.campaign_id 1u64;
    assert.eq r6.amount 700u64;
    async test_split_reward r0 r2 r4 into r7;
    output r7 as test_zk_airdrop_claim.aleo/test_split_reward.future;

finalize test_split_reward:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r2 as zk_airdrop_claim.aleo/claim_airdrop.future;
    await r0;
    await r1;
    await r2;

function test_merge_rewards:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/issue_eligibility self.caller 1u64 2u8 300u64 into r1 r2;
    call zk_airdrop_claim.aleo/claim_airdrop r1 into r3 r4;
    call zk_airdrop_claim.aleo/issue_eligibility self.caller 1u64 2u8 700u64 into r5 r6;
    call zk_airdrop_claim.aleo/claim_airdrop r5 into r7 r8;
    call zk_airdrop_claim.aleo/merge_rewards r3 r7 into r9;
    assert.eq r9.owner self.caller;
    assert.eq r9.campaign_id 1u64;
    assert.eq r9.amount 1000u64;
    async test_merge_rewards r0 r2 r4 r6 r8 into r10;
    output r10 as test_zk_airdrop_claim.aleo/test_merge_rewards.future;

finalize test_merge_rewards:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r2 as zk_airdrop_claim.aleo/claim_airdrop.future;
    input r3 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r4 as zk_airdrop_claim.aleo/claim_airdrop.future;
    await r0;
    await r1;
    await r2;
    await r3;
    await r4;

constructor:
    assert.eq edition 0u16;
