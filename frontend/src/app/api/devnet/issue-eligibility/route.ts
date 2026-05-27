import { NextRequest, NextResponse } from "next/server";

import { getDevnetAccountById } from "@/config/devnetAccounts";
import {
  executeLeoFunction,
  isLeoCliError,
} from "@/services/server/leoCli";

export const runtime = "nodejs";

type IssueEligibilityBody = {
  accountId?: string;
  receiver?: string;
  campaignId?: string;
  tier?: string;
  amount?: string;
  deadline?: string;
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

function extractEligibilityRecord(stdout: string) {
  const outputStart = stdout.search(/Outputs?|➡️\s*Outputs?/i);
  const outputText = outputStart >= 0 ? stdout.slice(outputStart) : stdout;

  return (
    extractBalancedBlocks(outputText).find(
      (block) =>
        /owner\s*:/.test(block) &&
        /campaign_id\s*:/.test(block) &&
        /tier\s*:/.test(block) &&
        /amount\s*:/.test(block) &&
        /deadline\s*:/.test(block),
    ) ?? null
  );
}

function validateBody(body: IssueEligibilityBody) {
  const requiredFields: Array<keyof IssueEligibilityBody> = [
    "accountId",
    "campaignId",
    "tier",
    "amount",
    "deadline",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export async function POST(request: NextRequest) {
  let stdout = "";
  let stderr = "";

  try {
    const body = (await request.json()) as IssueEligibilityBody;

    validateBody(body);

    const account = getDevnetAccountById(body.accountId!);

    const result = await executeLeoFunction("issue_eligibility", [
      account.address,
      body.campaignId!,
      body.tier!,
      body.amount!,
      body.deadline!,
    ]);

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
      eligibilityRecord: extractEligibilityRecord(result.stdout),
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (error) {
    if (isLeoCliError(error)) {
      stdout = error.stdout;
      stderr = error.stderr;
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to issue Eligibility record",
        stdout,
        stderr,
      },
      { status: 500 },
    );
  }
}
