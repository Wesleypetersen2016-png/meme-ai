import { NextRequest, NextResponse } from "next/server";
import { calculateMemeScore, type ScoreInput } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => null) as ScoreInput | null;
  if (!input || ![input.liquidity, input.holderGrowth, input.volumeAcceleration, input.smartWalletBuys, input.socialMomentum, input.rugRisk].every(Number.isFinite)) return NextResponse.json({ error: "All six normalized inputs (0–100) are required" }, { status: 400 });
  const score = calculateMemeScore(input);
  return NextResponse.json({ convictionScore: score, riskScore: Math.max(0, Math.min(100, Math.round(input.rugRisk))), risk: input.rugRisk <= 25 ? "Low" : input.rugRisk <= 55 ? "Medium" : "High", model: "meme-score-weighted-v1" });
}
