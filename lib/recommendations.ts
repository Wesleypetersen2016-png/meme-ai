import type { GoalProfile } from "@/hooks/use-goals";
import type { Token } from "@/lib/data";

export type Recommendation = {
  token: Token;
  action: "Consider" | "Watch" | "Avoid";
  fitScore: number;
  allocation: number;
  reasons: string[];
  projection: {
    timeframe: string;
    bear: number;
    base: number;
    bull: number;
    confidence: "Low" | "Medium";
  };
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function goalRecommendations(tokens: Token[], goals: GoalProfile): Recommendation[] {
  const riskPenalty = goals.riskTolerance === "conservative" ? 0.35 : goals.riskTolerance === "balanced" ? 0.18 : 0.08;
  return tokens
    .filter(token => token.chain === "MARKET" || goals.chains.includes(token.chain))
    .map(token => {
      const momentum = Math.max(-25, Math.min(40, (token.change ?? 0) * 0.4 + (token.change7d ?? token.change ?? 0) * 0.6));
      const objectiveBoost = goals.objective === "growth" ? momentum * 0.65 : goals.objective === "preservation" ? (100 - token.riskScore) * 0.15 : 4;
      const horizonBoost = goals.horizon === "intraday" ? Math.max(0, token.change1h ?? 0) * 1.8 : goals.horizon === "long-term" ? (100 - token.riskScore) * 0.08 : token.convictionScore * 0.08;
      const safetyBoost = (100 - token.riskScore) * 0.08;
      const fitScore = clamp(token.convictionScore + objectiveBoost + horizonBoost + safetyBoost - token.riskScore * riskPenalty);
      const action = fitScore >= goals.alertScore ? "Consider" : fitScore >= Math.max(55, goals.alertScore - 18) ? "Watch" : "Avoid";
      const reasons = [
        `${token.convictionScore} modeled IQ`,
        ...(token.socialScore === undefined ? [] : [`${token.socialScore} social IQ from ${token.socialSources}/3 sources`]),
        ...(token.change === undefined ? [] : [`${token.change >= 0 ? "+" : ""}${token.change.toFixed(1)}% over 24h`]),
        ...(token.change7d === undefined ? [] : [`${token.change7d >= 0 ? "+" : ""}${token.change7d.toFixed(1)}% over 7d`]),
        ...(token.rank === undefined ? [] : [`#${token.rank} by market cap`]),
        ...(token.volume24h === undefined ? [] : [`${token.volume24h} volume over 24h`]),
        token.risk === "Low" ? "Lower modeled risk" : `${token.risk.toLowerCase()} modeled risk`,
        ...(token.buySellRatio === undefined ? ["Buy/sell activity unavailable"] : Number(token.buySellRatio) >= 1 ? [`${token.buySellRatio}x buy/sell pressure`] : ["Sell pressure is elevated"]),
      ];
      const horizonFactor = goals.horizon === "intraday" ? 0.35 : goals.horizon === "swing" ? 0.8 : 1.35;
      const base = Math.round(Math.max(-30, Math.min(45, momentum * horizonFactor + (fitScore - 50) * 0.18)));
      const spread = Math.max(6, Math.round(6 + token.riskScore * 0.16));
      const projection = {
        timeframe: goals.horizon === "intraday" ? "24 hours" : goals.horizon === "swing" ? "7 days" : "30 days",
        bear: Math.max(-60, base - spread),
        base,
        bull: Math.min(90, base + spread),
        confidence: token.change !== undefined && token.buySellRatio !== undefined ? "Medium" : "Low",
      } as const;
      return { token, action, fitScore, allocation: Math.max(1, Math.min(goals.maxPosition, Math.round(fitScore / 12))), reasons, projection } as Recommendation;
    })
    .sort((a, b) => b.fitScore - a.fitScore);
}
