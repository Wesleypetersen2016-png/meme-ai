# NexIQ

NexIQ is a mobile-first crypto decision dashboard built with Next.js 15, TypeScript, and Tailwind CSS.

## Core experience

- **Today:** ranks 40 major non-stablecoin assets as Consider Buy, Wait, or Avoid using live CoinGecko market data and the user's strategy.
- **My Positions:** calculates live position value and return, then shows Hold, Consider Selling, Take Profit, or Sell when a saved loss rule is triggered.
- **Profile:** combines strategy, risk limits, alert preferences, identity, and appearance.
- Token-symbol research uses the broad-market universe; contract-address research uses DexScreener.
- Optional Reddit, X, and Discord credentials can enrich DEX token research. Missing sources remain unavailable and never receive placeholder values.

## Data honesty

The app does not contain fixture market prices or sample positions. If CoinGecko or DexScreener is unavailable, the relevant screen displays an unavailable state. IQ scores, risk scores, and scenario ranges are explicitly modeled from current inputs and are not guaranteed forecasts.

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Visit `http://localhost:3000`.

The keyless CoinGecko public API works for light use. Add `COINGECKO_API_KEY` for a dedicated Demo API allowance. Add the optional X, Reddit, and Discord credentials from `.env.example` to enable social research signals.

## Deployment

Import the repository into Vercel using the default Next.js settings. Production deployment runs automatically when `main` is pushed.
