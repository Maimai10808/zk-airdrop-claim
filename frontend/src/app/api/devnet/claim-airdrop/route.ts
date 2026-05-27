import { NextRequest, NextResponse } from "next/server";

import { getDevnetAccountById } from "@/config/devnetAccounts";
import {
  executeLeoFunction,
  isLeoCliError,
} from "@/services/server/leoCli";

export const runtime = "nodejs";

type ClaimAirdropBody = {
  accountId?: string;
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

export async function POST(request: NextRequest) {
  let stdout = "";
  let stderr = "";

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
    const isBalanceError = /insufficient|balance|fee/i.test(combinedOutput);
    const message = isBalanceError
      ? "The selected devnet account does not have enough public credits to pay the claim fee."
      : isRejected
        ? "This account has already claimed this campaign."
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
