import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const subscription = await request.json().catch(() => null);
  if (!subscription) return NextResponse.json({ error: "Push subscription is required" }, { status: 400 });
  // Persist with your database/provider here. Kept side-effect free until storage is configured.
  return NextResponse.json({ accepted: true, configured: false, message: "Connect a push provider and persistence layer before production delivery." }, { status: 202 });
}
