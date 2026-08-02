import { NextRequest, NextResponse } from "next/server";

export const revalidate = 30;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ error: "Pass a token symbol, name, or address in ?q=" }, { status: 400 });
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`, { next: { revalidate: 30 } });
    if (!response.ok) throw new Error(`DexScreener returned ${response.status}`);
    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "DexScreener request failed" }, { status: 502 });
  }
}
