import zk_airdrop_claim.aleo;
program test_zk_airdrop_claim.aleo;

function test_init_admin:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    async test_init_admin r0 into r1;
    output r1 as test_zk_airdrop_claim.aleo/test_init_admin.future;

finalize test_init_admin:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    await r0;

function test_issue_campaign:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/create_campaign 1u64 2000u64 into r1;
    call zk_airdrop_claim.aleo/issue_eligibility self.signer 1u64 2u8 1000u64 1800u64 into r2 r3;
    assert.eq r2.owner self.signer;
    assert.eq r2.campaign_id 1u64;
    assert.eq r2.tier 2u8;
    assert.eq r2.amount 1000u64;
    assert.eq r2.deadline 1800u64;
    async test_issue_campaign r0 r1 r3 into r4;
    output r4 as test_zk_airdrop_claim.aleo/test_issue_campaign.future;

finalize test_issue_campaign:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/create_campaign.future;
    input r2 as zk_airdrop_claim.aleo/issue_eligibility.future;
    await r0;
    await r1;
    await r2;

function test_claim:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/create_campaign 1u64 2000u64 into r1;
    call zk_airdrop_claim.aleo/issue_eligibility self.signer 1u64 2u8 1000u64 1800u64 into r2 r3;
    call zk_airdrop_claim.aleo/claim_airdrop r2 1000u64 into r4 r5;
    assert.eq r4.owner self.signer;
    assert.eq r4.campaign_id 1u64;
    assert.eq r4.amount 1000u64;
    async test_claim r0 r1 r3 r5 into r6;
    output r6 as test_zk_airdrop_claim.aleo/test_claim.future;

finalize test_claim:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/create_campaign.future;
    input r2 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r3 as zk_airdrop_claim.aleo/claim_airdrop.future;
    await r0;
    await r1;
    await r2;
    await r3;

function test_split:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/create_campaign 1u64 2000u64 into r1;
    call zk_airdrop_claim.aleo/issue_eligibility self.signer 1u64 2u8 1000u64 1800u64 into r2 r3;
    call zk_airdrop_claim.aleo/claim_airdrop r2 1000u64 into r4 r5;
    call zk_airdrop_claim.aleo/split_reward r4 300u64 into r6 r7;
    assert.eq r6.owner self.signer;
    assert.eq r6.campaign_id 1u64;
    assert.eq r6.amount 300u64;
    assert.eq r7.owner self.signer;
    assert.eq r7.campaign_id 1u64;
    assert.eq r7.amount 700u64;
    async test_split r0 r1 r3 r5 into r8;
    output r8 as test_zk_airdrop_claim.aleo/test_split.future;

finalize test_split:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/create_campaign.future;
    input r2 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r3 as zk_airdrop_claim.aleo/claim_airdrop.future;
    await r0;
    await r1;
    await r2;
    await r3;

function test_multi_campaign:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/create_campaign 1u64 2000u64 into r1;
    call zk_airdrop_claim.aleo/create_campaign 2u64 2000u64 into r2;
    call zk_airdrop_claim.aleo/issue_eligibility self.signer 1u64 2u8 300u64 1800u64 into r3 r4;
    call zk_airdrop_claim.aleo/claim_airdrop r3 1000u64 into r5 r6;
    call zk_airdrop_claim.aleo/issue_eligibility self.signer 2u64 3u8 700u64 1800u64 into r7 r8;
    call zk_airdrop_claim.aleo/claim_airdrop r7 1000u64 into r9 r10;
    assert.eq r5.owner self.signer;
    assert.eq r5.campaign_id 1u64;
    assert.eq r5.amount 300u64;
    assert.eq r9.owner self.signer;
    assert.eq r9.campaign_id 2u64;
    assert.eq r9.amount 700u64;
    async test_multi_campaign r0 r1 r2 r4 r6 r8 r10 into r11;
    output r11 as test_zk_airdrop_claim.aleo/test_multi_campaign.future;

finalize test_multi_campaign:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/create_campaign.future;
    input r2 as zk_airdrop_claim.aleo/create_campaign.future;
    input r3 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r4 as zk_airdrop_claim.aleo/claim_airdrop.future;
    input r5 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r6 as zk_airdrop_claim.aleo/claim_airdrop.future;
    await r0;
    await r1;
    await r2;
    await r3;
    await r4;
    await r5;
    await r6;

function test_double_claim_fail:
    call zk_airdrop_claim.aleo/initialize_admin into r0;
    call zk_airdrop_claim.aleo/create_campaign 1u64 2000u64 into r1;
    call zk_airdrop_claim.aleo/issue_eligibility self.signer 1u64 2u8 1000u64 1800u64 into r2 r3;
    call zk_airdrop_claim.aleo/claim_airdrop r2 1000u64 into r4 r5;
    assert.eq r4.owner self.signer;
    assert.eq r4.campaign_id 1u64;
    assert.eq r4.amount 1000u64;
    call zk_airdrop_claim.aleo/issue_eligibility self.signer 1u64 3u8 2000u64 1800u64 into r6 r7;
    call zk_airdrop_claim.aleo/claim_airdrop r6 1000u64 into r8 r9;
    assert.eq r8.owner self.signer;
    assert.eq r8.campaign_id 1u64;
    assert.eq r8.amount 2000u64;
    async test_double_claim_fail r0 r1 r3 r5 r7 r9 into r10;
    output r10 as test_zk_airdrop_claim.aleo/test_double_claim_fail.future;

finalize test_double_claim_fail:
    input r0 as zk_airdrop_claim.aleo/initialize_admin.future;
    input r1 as zk_airdrop_claim.aleo/create_campaign.future;
    input r2 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r3 as zk_airdrop_claim.aleo/claim_airdrop.future;
    input r4 as zk_airdrop_claim.aleo/issue_eligibility.future;
    input r5 as zk_airdrop_claim.aleo/claim_airdrop.future;
    await r0;
    await r1;
    await r2;
    await r3;
    await r4;
    await r5;

constructor:
    assert.eq edition 0u16;
