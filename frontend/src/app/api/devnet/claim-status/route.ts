import { NextRequest, NextResponse } from "next/server";

import { ALEO_CONFIG } from "@/config/aleo";
import { getDevnetAccountById } from "@/config/devnetAccounts";
import { computeClaimKey } from "@/services/server/claimKey";

export const runtime = "nodejs";

type ClaimStatusBody = {
  accountId?: string;
  campaignId?: string;
};

function buildDevnetMappingUrl(mappingName: string, key: string) {
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

  return `${endpoint.replace(/\/$/, "")}/${network}/program/${programId}/mapping/${mappingName}/${key}`;
}

async function queryClaimedMapping(claimKey: string) {
  const response = await fetch(
    buildDevnetMappingUrl(ALEO_CONFIG.mappings.claimed, claimKey),
    {
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to query claimed mapping: ${response.status} ${response.statusText}`,
    );
  }

  const raw = await response.text();

  return /\btrue\b/i.test(raw);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClaimStatusBody;

    if (!body.accountId) {
      throw new Error("Missing required field: accountId");
    }

    if (!body.campaignId) {
      throw new Error("Missing required field: campaignId");
    }

    const account = getDevnetAccountById(body.accountId);
    const claimKey = computeClaimKey(account.address, body.campaignId);
    const claimed = await queryClaimedMapping(claimKey);

    return NextResponse.json({
      ok: true,
      account: {
        id: account.id,
        label: account.label,
        address: account.address,
      },
      campaignId: body.campaignId,
      claimKey,
      claimed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load account claim status",
      },
      { status: 500 },
    );
  }
}
