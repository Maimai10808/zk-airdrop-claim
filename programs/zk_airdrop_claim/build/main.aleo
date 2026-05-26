program zk_airdrop_claim.aleo;

record Eligibility:
    owner as address.private;
    campaign_id as u64.private;
    tier as u8.private;
    amount as u64.private;
    deadline as u64.private;

record Reward:
    owner as address.private;
    campaign_id as u64.private;
    amount as u64.private;

struct Campaign:
    enabled as boolean;
    deadline as u64;
    total_claimed_users as u64;
    total_claimed_amount as u64;

mapping admin:
    key as u8.public;
    value as address.public;

mapping campaigns:
    key as u64.public;
    value as Campaign.public;

mapping claimed:
    key as field.public;
    value as boolean.public;

function initialize_admin:
    async initialize_admin self.caller into r0;
    output r0 as zk_airdrop_claim.aleo/initialize_admin.future;

finalize initialize_admin:
    input r0 as address.public;
    contains admin[0u8] into r1;
    not r1 into r2;
    assert.eq r2 true;
    set r0 into admin[0u8];

function transfer_admin:
    input r0 as address.public;
    async transfer_admin self.caller r0 into r1;
    output r1 as zk_airdrop_claim.aleo/transfer_admin.future;

finalize transfer_admin:
    input r0 as address.public;
    input r1 as address.public;
    get admin[0u8] into r2;
    assert.eq r0 r2;
    set r1 into admin[0u8];

function create_campaign:
    input r0 as u64.public;
    input r1 as u64.public;
    async create_campaign self.caller r0 r1 into r2;
    output r2 as zk_airdrop_claim.aleo/create_campaign.future;

finalize create_campaign:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as u64.public;
    get admin[0u8] into r3;
    assert.eq r0 r3;
    contains campaigns[r1] into r4;
    not r4 into r5;
    assert.eq r5 true;
    cast true r2 0u64 0u64 into r6 as Campaign;
    set r6 into campaigns[r1];

function set_campaign_enabled:
    input r0 as u64.public;
    input r1 as boolean.public;
    async set_campaign_enabled self.caller r0 r1 into r2;
    output r2 as zk_airdrop_claim.aleo/set_campaign_enabled.future;

finalize set_campaign_enabled:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as boolean.public;
    get admin[0u8] into r3;
    assert.eq r0 r3;
    get campaigns[r1] into r4;
    cast r2 r4.deadline r4.total_claimed_users r4.total_claimed_amount into r5 as Campaign;
    set r5 into campaigns[r1];

function set_campaign_deadline:
    input r0 as u64.public;
    input r1 as u64.public;
    async set_campaign_deadline self.caller r0 r1 into r2;
    output r2 as zk_airdrop_claim.aleo/set_campaign_deadline.future;

finalize set_campaign_deadline:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as u64.public;
    get admin[0u8] into r3;
    assert.eq r0 r3;
    get campaigns[r1] into r4;
    cast r4.enabled r2 r4.total_claimed_users r4.total_claimed_amount into r5 as Campaign;
    set r5 into campaigns[r1];

function issue_eligibility:
    input r0 as address.private;
    input r1 as u64.private;
    input r2 as u8.private;
    input r3 as u64.private;
    input r4 as u64.private;
    gt r3 0u64 into r5;
    assert.eq r5 true;
    gt r2 0u8 into r6;
    assert.eq r6 true;
    cast r0 r1 r2 r3 r4 into r7 as Eligibility.record;
    async issue_eligibility self.caller r1 r4 into r8;
    output r7 as Eligibility.record;
    output r8 as zk_airdrop_claim.aleo/issue_eligibility.future;

finalize issue_eligibility:
    input r0 as address.public;
    input r1 as u64.public;
    input r2 as u64.public;
    get admin[0u8] into r3;
    assert.eq r0 r3;
    get campaigns[r1] into r4;
    assert.eq r4.enabled true;
    lte r2 r4.deadline into r5;
    assert.eq r5 true;

function claim_airdrop:
    input r0 as Eligibility.record;
    input r1 as u64.public;
    assert.eq self.signer r0.owner;
    gt r0.amount 0u64 into r2;
    assert.eq r2 true;
    gt r0.tier 0u8 into r3;
    assert.eq r3 true;
    lte r1 r0.deadline into r4;
    assert.eq r4 true;
    cast self.signer into r5 as field;
    cast r0.campaign_id into r6 as field;
    add r5 r6 into r7;
    cast r0.owner r0.campaign_id r0.amount into r8 as Reward.record;
    async claim_airdrop r0.campaign_id r1 r7 r0.amount into r9;
    output r8 as Reward.record;
    output r9 as zk_airdrop_claim.aleo/claim_airdrop.future;

finalize claim_airdrop:
    input r0 as u64.public;
    input r1 as u64.public;
    input r2 as field.public;
    input r3 as u64.public;
    get campaigns[r0] into r4;
    assert.eq r4.enabled true;
    lte r1 r4.deadline into r5;
    assert.eq r5 true;
    get.or_use claimed[r2] false into r6;
    not r6 into r7;
    assert.eq r7 true;
    set true into claimed[r2];
    add r4.total_claimed_users 1u64 into r8;
    add r4.total_claimed_amount r3 into r9;
    cast r4.enabled r4.deadline r8 r9 into r10 as Campaign;
    set r10 into campaigns[r0];

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
