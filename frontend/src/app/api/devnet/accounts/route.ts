import { NextResponse } from "next/server";

import { getPublicDevnetAccounts } from "@/config/devnetAccounts";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      accounts: getPublicDevnetAccounts(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load devnet accounts",
      },
      { status: 500 },
    );
  }
}
