export type Token = {
  id?: string;
  address?: string;
  pairUrl?: string;
  pairCreatedAt?: number;
  socialScore?: number;
  socialMentions?: number;
  socialSources?: number;
  name: string;
  symbol: string;
  color: string;
  price: string;
  change?: number;
  marketCap: string;
  liquidity: string;
  volume5m: string;
  volume1h: string;
  buySellRatio?: string;
  convictionScore: number;
  riskScore: number;
  risk: "Low" | "Medium" | "High";
  chain: string;
};

// This is a discovery universe, not market data. Every displayed value is fetched live.
export const trackedMarkets = [
  { symbol: "PEPE", chain: "ETH", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933" },
  { symbol: "BONK", chain: "SOL", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { symbol: "MOG", chain: "ETH", address: "0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a" },
  { symbol: "POPCAT", chain: "SOL", address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr" },
  { symbol: "GIGA", chain: "SOL", address: "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9" },
] as const;
