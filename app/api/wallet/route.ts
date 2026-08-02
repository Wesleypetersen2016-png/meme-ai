import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { address?: string } | null;
  const address = body?.address?.trim();
  if (!address) return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  if (!process.env.SOLANA_RPC_URL) return NextResponse.json({ error: "SOLANA_RPC_URL is not configured" }, { status: 503 });
  try {
    const rpc = async (method: string, params: unknown[]) => {
      const response = await fetch(process.env.SOLANA_RPC_URL!, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), cache: "no-store" });
      if (!response.ok) throw new Error(`Wallet RPC returned ${response.status}`);
      return response.json();
    };
    const [balance, tokens] = await Promise.all([
      rpc("getBalance", [address]),
      rpc("getTokenAccountsByOwner", [address, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }]),
    ]);
    return NextResponse.json({ address, balance, tokens, trackedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Wallet tracking failed" }, { status: 502 });
  }
}
