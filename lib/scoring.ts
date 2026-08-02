export type ScoreInput = { liquidity: number; holderGrowth: number; volumeAcceleration: number; smartWalletBuys: number; socialMomentum: number; rugRisk: number };

/** Placeholder heuristic. Replace with a trained model without changing the UI contract. */
export function calculateMemeScore(input: ScoreInput) {
  const clamp = (value: number) => Math.max(0, Math.min(100, value));
  const weighted = clamp(input.liquidity) * .22 + clamp(input.holderGrowth) * .16 + clamp(input.volumeAcceleration) * .19 + clamp(input.smartWalletBuys) * .18 + clamp(input.socialMomentum) * .15 + (100 - clamp(input.rugRisk)) * .10;
  return Math.round(clamp(weighted));
}

export const SCORE_WEIGHTS = { liquidity: .22, holderGrowth: .16, volumeAcceleration: .19, smartWalletBuys: .18, socialMomentum: .15, rugRisk: .10 } as const;
