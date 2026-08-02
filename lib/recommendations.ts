import type { GoalProfile } from "@/hooks/use-goals";
import type { Token } from "@/lib/data";

export type MarketRegime = {
  label: "Risk-on" | "Mixed" | "Risk-off";
  breadth24h: number;
  breadth7d: number;
  score: number;
};

export type Recommendation = {
  token: Token;
  action: "Consider" | "Watch" | "Avoid";
  fitScore: number;
  allocation: number;
  reasons: string[];
  cautions: string[];
  breakdown: {
    momentum: number;
    quality: number;
    stability: number;
    goalFit: number;
  };
  projection: {
    timeframe: string;
    bear: number;
    base: number;
    bull: number;
    confidence: "Low" | "Medium" | "Higher";
  };
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const finite = (value: number | undefined) => typeof value === "number" && Number.isFinite(value);

export function getMarketRegime(tokens: Token[]): MarketRegime {
  const eligible = tokens.filter(token => finite(token.change) && finite(token.change7d));
  if (!eligible.length) return { label: "Mixed", breadth24h: 50, breadth7d: 50, score: 50 };
  const breadth24h = Math.round(eligible.filter(token => (token.change ?? 0) > 0).length / eligible.length * 100);
  const breadth7d = Math.round(eligible.filter(token => (token.change7d ?? 0) > 0).length / eligible.length * 100);
  const score = Math.round(breadth24h * 0.4 + breadth7d * 0.6);
  return { label: score >= 62 ? "Risk-on" : score <= 38 ? "Risk-off" : "Mixed", breadth24h, breadth7d, score };
}

function dataConfidence(token: Token): Recommendation["projection"]["confidence"] {
  const points = [token.change1h, token.change, token.change7d, token.rank, token.riskScore, token.convictionScore].filter(finite).length;
  if (points >= 6 && token.volume24h && token.lastUpdated) return "Higher";
  if (points >= 5) return "Medium";
  return "Low";
}

export function goalRecommendations(tokens: Token[], goals: GoalProfile): Recommendation[] {
  const marketRegime = getMarketRegime(tokens.filter(token => token.chain === "MARKET"));
  return tokens
    .filter(token => token.chain === "MARKET" || goals.chains.includes(token.chain))
    .map(token => {
      const hour = token.change1h ?? 0;
      const day = token.change ?? 0;
      const week = token.change7d ?? day;
      const momentum = clamp(50 + hour * 2 + day * 1.8 + week * 1.1);
      const quality = clamp(token.convictionScore * 0.58 + (token.rank ? Math.max(10, 102 - token.rank * 2.1) : 35) * 0.42);
      const stability = clamp(100 - token.riskScore);
      const objectiveFit = goals.objective === "growth" ? momentum : goals.objective === "preservation" ? stability : (quality + stability) / 2;
      const horizonFit = goals.horizon === "intraday" ? clamp(50 + hour * 5 + day * 1.2) : goals.horizon === "long-term" ? clamp(quality * 0.65 + stability * 0.35) : clamp(momentum * 0.65 + quality * 0.35);
      const riskWeight = goals.riskTolerance === "conservative" ? 0.35 : goals.riskTolerance === "balanced" ? 0.23 : 0.13;
      const regimeAdjustment = marketRegime.label === "Risk-on" ? 4 : marketRegime.label === "Risk-off" ? -7 : 0;
      const goalFit = clamp(objectiveFit * 0.55 + horizonFit * 0.45);
      const fitScore = clamp(momentum * 0.28 + quality * 0.27 + stability * riskWeight + goalFit * (0.45 - riskWeight) + regimeAdjustment);

      const tooRisky = goals.riskTolerance === "conservative" ? token.riskScore > 42 : goals.riskTolerance === "balanced" ? token.riskScore > 62 : token.riskScore > 78;
      const fallingTrend = day < -4 && week < -7;
      const overextended = day > 14 || week > 35;
      const consider = fitScore >= goals.alertScore && !tooRisky && !fallingTrend && !overextended;
      const watchFloor = Math.max(52, goals.alertScore - 16);
      const action = consider ? "Consider" : fitScore >= watchFloor && !fallingTrend ? "Watch" : "Avoid";

      const reasons = [
        `${token.convictionScore} market-quality score`,
        ...(finite(token.change) ? [`${day >= 0 ? "+" : ""}${day.toFixed(1)}% over 24h`] : []),
        ...(finite(token.change7d) ? [`${week >= 0 ? "+" : ""}${week.toFixed(1)}% over 7d`] : []),
        ...(token.rank === undefined ? [] : [`#${token.rank} by market cap`]),
        ...(token.volume24h === undefined ? [] : [`${token.volume24h} traded over 24h`]),
        `${marketRegime.breadth24h}% of the tracked market is up today`,
      ];
      const cautions = [
        ...(tooRisky ? [`Risk score ${token.riskScore}/100 exceeds your ${goals.riskTolerance} comfort range`] : []),
        ...(fallingTrend ? ["Both daily and weekly momentum are falling"] : []),
        ...(overextended ? ["Recent momentum is unusually extended; chasing may increase downside"] : []),
        ...(marketRegime.label === "Risk-off" ? ["Broad-market participation is weak"] : []),
        ...(token.chain !== "MARKET" && token.buySellRatio === undefined ? ["Live buy/sell pressure is unavailable"] : []),
      ];

      const horizonFactor = goals.horizon === "intraday" ? 0.28 : goals.horizon === "swing" ? 0.64 : 1.05;
      const observedTrend = hour * 0.1 + day * 0.35 + week * 0.55;
      const base = Math.round(Math.max(-25, Math.min(35, observedTrend * horizonFactor + regimeAdjustment * 0.25)));
      const spread = Math.max(7, Math.round(7 + token.riskScore * 0.13));
      const projection = {
        timeframe: goals.horizon === "intraday" ? "24-hour" : goals.horizon === "swing" ? "7-day" : "30-day",
        bear: Math.max(-60, base - spread),
        base,
        bull: Math.min(75, base + spread),
        confidence: dataConfidence(token),
      } as const;
      return {
        token,
        action,
        fitScore,
        allocation: Math.max(1, Math.min(goals.maxPosition, Math.round(fitScore / 13))),
        reasons,
        cautions,
        breakdown: { momentum, quality, stability, goalFit },
        projection,
      } as Recommendation;
    })
    .sort((a, b) => b.fitScore - a.fitScore);
}
