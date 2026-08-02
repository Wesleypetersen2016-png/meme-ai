# NexIQ

Mobile-first meme token intelligence dashboard built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- Dashboard, Scanner, Watchlist, Active Buys, Goals, and Settings routes
- Goal-aware recommendations and position review signals
- Live DexScreener refresh plus symbol and token-address lookup
- Optional Reddit, X, and Discord activity, engagement, and sentiment scoring with transparent source coverage
- Device-persistent goals, appearance, watchlist, positions, and alert preferences
- Reusable button and responsive token-table primitives
- Dark UI, mobile bottom navigation, desktop sidebar, and command-style search

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Visit `http://localhost:3000`.

## Social signals

Add the optional X, Reddit, and Discord credentials from `.env.example` to activate social scoring. Discord channel IDs are comma-separated, and the bot must be able to read those channels. Sources without credentials are shown as unavailable and do not affect IQ Score.

## Vercel deployment

Import the repository into Vercel. The default Next.js settings work without changes. DexScreener works without an API key.

Production deployment runs automatically on pushes to `main` through `.github/workflows/vercel-production.yml` after adding `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub repository secrets.

The interface starts empty and displays market values only after DexScreener returns current data. Unavailable fields remain explicitly unavailable.
