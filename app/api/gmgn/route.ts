import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address) return NextResponse.json({ error: "Pass a token address in ?address=" }, { status: 400 });
  if (!process.env.GMGN_API_BASE_URL) return NextResponse.json({ error: "GMGN_API_BASE_URL is not configured", placeholder: true }, { status: 503 });
  try {
    const response = await fetch(`${process.env.GMGN_API_BASE_URL}/token/${encodeURIComponent(address)}`, { headers: process.env.GMGN_API_KEY ? { Authorization: `Bearer ${process.env.GMGN_API_KEY}` } : {}, next: { revalidate: 30 } });
    if (!response.ok) throw new Error(`GMGN adapter returned ${response.status}`);
    return NextResponse.json(await response.json());
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "GMGN request failed" }, { status: 502 }); }
}
