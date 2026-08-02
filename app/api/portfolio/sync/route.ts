import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GoldRushItem = {
  contract_decimals?: number;
  contract_name?: string;
  contract_ticker_symbol?: string;
  contract_address?: string;
  logo_url?: string;
  balance?: string;
  quote?: number | null;
  quote_rate?: number | null;
  native_token?: boolean;
};

type GoldRushResponse = { data?: { items?: GoldRushItem[] }; error?: boolean; error_message?: string };
type ChainRequest = { slug: string; label: string; address: string };

const evmPattern = /^0x[a-fA-F0-9]{40}$/;
const solanaPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

async function balancesFor(chain: ChainRequest, apiKey: string) {
  const response = await fetch(`https://api.covalenthq.com/v1/${chain.slug}/address/${chain.address}/balances_v2/?nft=false&no-nft-fetch=true`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
  const payload = await response.json() as GoldRushResponse;
  if (!response.ok || payload.error) throw new Error(payload.error_message || `${chain.label} balance lookup failed`);
  return (payload.data?.items ?? []).flatMap(item => {
    const decimals = item.contract_decimals ?? 0;
    const raw = Number(item.balance ?? 0);
    const amount = Number.isFinite(raw) ? raw / 10 ** decimals : 0;
    const value = typeof item.quote === "number" && Number.isFinite(item.quote) ? item.quote : null;
    if (amount <= 0 || (value !== null && value < 0.01)) return [];
    return [{
      id: `${chain.slug}:${item.contract_address ?? item.contract_ticker_symbol ?? "native"}`,
      chain: chain.label,
      symbol: item.contract_ticker_symbol || "UNKNOWN",
      name: item.contract_name || item.contract_ticker_symbol || "Unknown asset",
      amount,
      value,
      price: typeof item.quote_rate === "number" && Number.isFinite(item.quote_rate) ? item.quote_rate : null,
      address: item.contract_address,
      image: item.logo_url,
      native: Boolean(item.native_token),
    }];
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.GOLDRUSH_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Read-only portfolio sync is not configured yet." }, { status: 503 });
  let body: { evmAddress?: string; solanaAddress?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const evmAddress = body.evmAddress?.trim() ?? "";
  const solanaAddress = body.solanaAddress?.trim() ?? "";
  if (!evmAddress && !solanaAddress) return NextResponse.json({ error: "Add at least one public wallet address." }, { status: 400 });
  if (evmAddress && !evmPattern.test(evmAddress)) return NextResponse.json({ error: "The EVM address is not valid." }, { status: 400 });
  if (solanaAddress && !solanaPattern.test(solanaAddress)) return NextResponse.json({ error: "The Solana address is not valid." }, { status: 400 });

  const chains: ChainRequest[] = [
    ...(evmAddress ? [
      { slug: "base-mainnet", label: "Base", address: evmAddress },
      { slug: "bsc-mainnet", label: "BNB Chain", address: evmAddress },
      { slug: "monad-mainnet", label: "Monad", address: evmAddress },
    ] : []),
    ...(solanaAddress ? [{ slug: "solana-mainnet", label: "Solana", address: solanaAddress }] : []),
  ];
  const results = await Promise.allSettled(chains.map(chain => balancesFor(chain, apiKey)));
  const holdings = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
  const failedChains = results.flatMap((result, index) => result.status === "rejected" ? [chains[index].label] : []);
  if (!holdings.length && failedChains.length === chains.length) return NextResponse.json({ error: "The portfolio provider could not read these addresses. Try again shortly." }, { status: 502 });
  return NextResponse.json({ holdings, failedChains, provider: "GoldRush", updatedAt: new Date().toISOString() });
}
