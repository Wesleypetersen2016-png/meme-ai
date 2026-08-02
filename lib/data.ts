export type Token = { name: string; symbol: string; color: string; price: string; change: number; marketCap: string; liquidity: string; volume5m: string; volume1h: string; holders: string; buySellRatio: string; convictionScore: number; riskScore: number; risk: "Low" | "Medium" | "High"; chain: string };

export const tokens: Token[] = [
  { name: "Pepe", symbol: "PEPE", color: "#73c770", price: "$0.0000124", change: 18.4, marketCap: "$5.21B", liquidity: "$48.2M", volume5m: "$4.8M", volume1h: "$61.2M", holders: "391K", buySellRatio: "1.84", convictionScore: 92, riskScore: 14, risk: "Low", chain: "ETH" },
  { name: "Bonk", symbol: "BONK", color: "#f3a94e", price: "$0.0000247", change: 11.2, marketCap: "$1.82B", liquidity: "$31.7M", volume5m: "$2.1M", volume1h: "$28.4M", holders: "806K", buySellRatio: "1.62", convictionScore: 88, riskScore: 18, risk: "Low", chain: "SOL" },
  { name: "Mog Coin", symbol: "MOG", color: "#a988e7", price: "$0.00000172", change: 32.8, marketCap: "$674M", liquidity: "$9.8M", volume5m: "$894K", volume1h: "$8.7M", holders: "46.8K", buySellRatio: "2.14", convictionScore: 84, riskScore: 36, risk: "Medium", chain: "ETH" },
  { name: "Popcat", symbol: "POPCAT", color: "#dbc8a8", price: "$0.742", change: 7.6, marketCap: "$727M", liquidity: "$12.1M", volume5m: "$641K", volume1h: "$6.9M", holders: "118K", buySellRatio: "1.31", convictionScore: 81, riskScore: 29, risk: "Medium", chain: "SOL" },
  { name: "Gigachad", symbol: "GIGA", color: "#6ca5d9", price: "$0.0381", change: -4.3, marketCap: "$365M", liquidity: "$6.4M", volume5m: "$218K", volume1h: "$2.9M", holders: "71.2K", buySellRatio: "0.82", convictionScore: 73, riskScore: 67, risk: "High", chain: "SOL" },
];
