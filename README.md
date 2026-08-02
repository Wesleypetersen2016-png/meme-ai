# Meme AI

Mobile-first meme token intelligence dashboard built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- Dashboard, Scanner, Watchlist, Portfolio, and Settings routes
- Responsive token intelligence table and market visualizations
- Weighted conviction scoring engine in `lib/scoring.ts` with liquidity, holder growth, volume acceleration, smart wallet buys, social momentum, and inverse rug-risk inputs
- Server API adapters for DexScreener, Birdeye, GMGN, Solana wallet tracking, push subscriptions, and scoring
- Device-persistent watchlist and portfolio hooks plus service-worker push notification hooks
- shadcn/ui configuration and reusable Button, Card, and Badge primitives
- Dark UI, mobile bottom navigation, desktop sidebar, and command-style search

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Visit `http://localhost:3000`.

## Vercel deployment

Import the repository into Vercel. The default Next.js settings work without changes. Configure the keys from `.env.example` in project environment variables. DexScreener works without a key.

Production deployment runs automatically on pushes to `main` through `.github/workflows/vercel-production.yml` after adding `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub repository secrets.

The dashboard currently uses realistic fixture data; wire the API responses into the table when production data contracts are finalized.
