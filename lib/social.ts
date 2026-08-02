import type { Token } from "@/lib/data";

export type SocialSource = {
  status: "live" | "unconfigured" | "error";
  mentions: number;
  engagement: number;
  sentiment: number | null;
  score: number | null;
};

export type SocialSignal = {
  query: string;
  score: number | null;
  mentions: number;
  sources: { reddit: SocialSource; x: SocialSource; discord: SocialSource };
};

export function applySocialSignal(token: Token, signal: SocialSignal): Token {
  if (signal.score === null) return token;
  const convictionScore = Math.max(0, Math.min(100, Math.round(token.convictionScore * 0.82 + signal.score * 0.18)));
  return {
    ...token,
    convictionScore,
    socialScore: signal.score,
    socialMentions: signal.mentions,
    socialSources: Object.values(signal.sources).filter(source => source.status === "live").length,
  };
}
