import { NextRequest, NextResponse } from "next/server";

import { ALEO_CONFIG } from "@/config/aleo";
import { getDevnetAccountById } from "@/config/devnetAccounts";
import { computeClaimKey } from "@/services/server/claimKey";
import {
  executeLeoFunction,
  isLeoCliError,
} from "@/services/server/leoCli";

export const runtime = "nodejs";

type ClaimAirdropBody = {
  accountId?: string;
  campaignId?: string;
  eligibilityRecord?: string;
  currentTime?: string;
};

function extractBalancedBlocks(text: string) {
  const blocks: string[] = [];
  let depth = 0;
  let start = -1;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === "{") {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0 && start >= 0) {
        blocks.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return blocks;
}

function extractRewardRecord(stdout: string) {
  const outputStart = stdout.search(/Outputs?|➡️\s*Outputs?/i);
  const outputText = outputStart >= 0 ? stdout.slice(outputStart) : stdout;

  return (
    extractBalancedBlocks(outputText).find(
      (block) =>
        /owner\s*:/.test(block) &&
        /campaign_id\s*:/.test(block) &&
        /amount\s*:/.test(block) &&
        !/tier\s*:/.test(block) &&
        !/deadline\s*:/.test(block),
    ) ?? null
  );
}

function buildDevnetClaimedUrl(claimKey: string) {
  const endpoint =
    process.env.ALEO_DEVNET_ENDPOINT ??
    process.env.NEXT_PUBLIC_ALEO_API_BASE_URL ??
    "http://localhost:3030";
  const network =
    process.env.ALEO_DEVNET_NETWORK ??
    process.env.NEXT_PUBLIC_ALEO_NETWORK ??
    "testnet";
  const programId =
    process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID ?? ALEO_CONFIG.programId;

  return `${endpoint.replace(/\/$/, "")}/${network}/program/${programId}/mapping/${ALEO_CONFIG.mappings.claimed}/${claimKey}`;
}

async function hasClaimedOnChain(address: string, campaignId?: string) {
  if (!campaignId) {
    return false;
  }

  const claimKey = computeClaimKey(address, campaignId);
  const response = await fetch(buildDevnetClaimedUrl(claimKey), {
    cache: "no-store",
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    return false;
  }

  return /\btrue\b/i.test(await response.text());
}

function hasInsufficientBalanceError(output: string) {
  return /insufficient|not enough|does not have enough|can't pay|cannot pay|unable to pay/i.test(
    output,
  );
}

export async function POST(request: NextRequest) {
  let stdout = "";
  let stderr = "";
  let accountAddress = "";
  let campaignId: string | undefined;

  try {
    const body = (await request.json()) as ClaimAirdropBody;

    if (!body.accountId) {
      throw new Error("Missing required field: accountId");
    }

    if (!body.eligibilityRecord) {
      throw new Error(
        "Eligibility record parsing failed. Please inspect issue_eligibility stdout.",
      );
    }

    if (!body.currentTime) {
      throw new Error("Missing required field: currentTime");
    }

    const account = getDevnetAccountById(body.accountId);
    accountAddress = account.address;
    campaignId = body.campaignId;

    const result = await executeLeoFunction(
      "claim_airdrop",
      [body.eligibilityRecord, body.currentTime],
      {
        privateKey: account.privateKey,
      },
    );

    stdout = result.stdout;
    stderr = result.stderr;

    return NextResponse.json({
      ok: true,
      account: {
        id: account.id,
        label: account.label,
        address: account.address,
      },
      txId: result.txId,
      rewardRecord: extractRewardRecord(result.stdout),
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (error) {
    if (isLeoCliError(error)) {
      stdout = error.stdout;
      stderr = error.stderr;
    }

    const combinedOutput = `${stdout}\n${stderr}`;
    const isRejected = /Transaction rejected/i.test(combinedOutput);
    const isBalanceError = hasInsufficientBalanceError(combinedOutput);
    const alreadyClaimed =
      isRejected && (await hasClaimedOnChain(accountAddress, campaignId));
    const message = isBalanceError
      ? "The selected devnet account does not have enough public credits to pay the claim fee."
      : alreadyClaimed
        ? "This account has already claimed this campaign."
        : isRejected
          ? "claim_airdrop was rejected on-chain. Check Leo CLI details below."
          : error instanceof Error
            ? error.message
            : "Failed to claim airdrop";

    return NextResponse.json(
      {
        ok: false,
        error: message,
        stdout,
        stderr,
      },
      { status: 500 },
    );
  }
}
