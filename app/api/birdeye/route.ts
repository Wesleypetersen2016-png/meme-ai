import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address) return NextResponse.json({ error: "Pass a token address in ?address=" }, { status: 400 });
  if (!process.env.BIRDEYE_API_KEY) return NextResponse.json({ error: "BIRDEYE_API_KEY is not configured" }, { status: 503 });
  try {
    const response = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${encodeURIComponent(address)}`, {
      headers: { "X-API-KEY": process.env.BIRDEYE_API_KEY, "x-chain": request.nextUrl.searchParams.get("chain") || "solana" },
      next: { revalidate: 30 },
    });
    if (!response.ok) throw new Error(`Birdeye returned ${response.status}`);
    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Birdeye request failed" }, { status: 502 });
  }
}
