program zk_airdrop_claim.aleo;

record Eligibility:
    owner as address.private;
    campaign_id as u64.private;
    tier as u8.private;
    amount as u64.private;

record Reward:
    owner as address.private;
    campaign_id as u64.private;
    amount as u64.private;

mapping admin:
    key as u8.public;
    value as address.public;

mapping campaign_claim_count:
    key as u64.public;
    value as u64.public;

function initialize_admin:
    async initialize_admin self.caller into r0;
    output r0 as zk_airdrop_claim.aleo/initialize_admin.future;

finalize initialize_admin:
    input r0 as address.public;
    contains admin[0u8] into r1;
    not r1 into r2;
    assert.eq r2 true;
    set r0 into admin[0u8];

function issue_eligibility:
    input r0 as address.private;
    input r1 as u64.private;
    input r2 as u8.private;
    input r3 as u64.private;
    gt r3 0u64 into r4;
    assert.eq r4 true;
    gt r2 0u8 into r5;
    assert.eq r5 true;
    cast r0 r1 r2 r3 into r6 as Eligibility.record;
    async issue_eligibility self.caller into r7;
    output r6 as Eligibility.record;
    output r7 as zk_airdrop_claim.aleo/issue_eligibility.future;

finalize issue_eligibility:
    input r0 as address.public;
    get admin[0u8] into r1;
    assert.eq r0 r1;

function claim_airdrop:
    input r0 as Eligibility.record;
    assert.eq self.signer r0.owner;
    gt r0.amount 0u64 into r1;
    assert.eq r1 true;
    gt r0.tier 0u8 into r2;
    assert.eq r2 true;
    cast r0.owner r0.campaign_id r0.amount into r3 as Reward.record;
    async claim_airdrop r0.campaign_id into r4;
    output r3 as Reward.record;
    output r4 as zk_airdrop_claim.aleo/claim_airdrop.future;

finalize claim_airdrop:
    input r0 as u64.public;
    get.or_use campaign_claim_count[r0] 0u64 into r1;
    add r1 1u64 into r2;
    set r2 into campaign_claim_count[r0];

function split_reward:
    input r0 as Reward.record;
    input r1 as u64.private;
    assert.eq self.signer r0.owner;
    gt r1 0u64 into r2;
    assert.eq r2 true;
    gte r0.amount r1 into r3;
    assert.eq r3 true;
    cast r0.owner r0.campaign_id r1 into r4 as Reward.record;
    sub r0.amount r1 into r5;
    cast r0.owner r0.campaign_id r5 into r6 as Reward.record;
    output r4 as Reward.record;
    output r6 as Reward.record;

function merge_rewards:
    input r0 as Reward.record;
    input r1 as Reward.record;
    assert.eq self.signer r0.owner;
    assert.eq self.signer r1.owner;
    assert.eq r0.owner r1.owner;
    assert.eq r0.campaign_id r1.campaign_id;
    add r0.amount r1.amount into r2;
    cast r0.owner r0.campaign_id r2 into r3 as Reward.record;
    output r3 as Reward.record;

constructor:
    assert.eq edition 0u16;
