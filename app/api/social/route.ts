import { NextRequest, NextResponse } from "next/server";
import type { SocialSignal, SocialSource } from "@/lib/social";

export const revalidate = 300;

const unavailable = (status: SocialSource["status"]): SocialSource => ({ status, mentions: 0, engagement: 0, sentiment: null, score: null });
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const positiveWords = new Set(["buy", "bullish", "breakout", "growth", "strong", "up", "gain", "gains", "moon", "momentum", "accumulate", "support"]);
const negativeWords = new Set(["sell", "bearish", "rug", "rugpull", "scam", "down", "dump", "weak", "risk", "avoid", "exit", "warning"]);
const sentimentOf = (texts: string[]) => {
  let positive = 0; let negative = 0;
  for (const text of texts) for (const word of text.toLowerCase().match(/[a-z]+/g) ?? []) {
    if (positiveWords.has(word)) positive += 1;
    if (negativeWords.has(word)) negative += 1;
  }
  const total = positive + negative;
  return total ? (positive - negative) / total : 0;
};
const scoreActivity = (mentions: number, engagement: number, sentiment: number) => clamp((Math.log10(mentions + 1) * 30 + Math.log10(engagement + 1) * 20) * 0.75 + (sentiment + 1) * 12.5);

async function fetchX(query: string): Promise<SocialSource> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return unavailable("unconfigured");
  try {
    const response = await fetch(`https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(`${query} lang:en -is:retweet`)}&max_results=10&tweet.fields=public_metrics`, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`X returned ${response.status}`);
    const payload = await response.json() as { data?: Array<{ text?: string; public_metrics?: { like_count?: number; retweet_count?: number; reply_count?: number; quote_count?: number } }> };
    const posts = payload.data ?? [];
    const engagement = posts.reduce((total, post) => total + (post.public_metrics?.like_count ?? 0) + (post.public_metrics?.retweet_count ?? 0) * 2 + (post.public_metrics?.reply_count ?? 0) + (post.public_metrics?.quote_count ?? 0) * 2, 0);
    const sentiment = sentimentOf(posts.map(post => post.text ?? ""));
    return { status: "live", mentions: posts.length, engagement, sentiment, score: scoreActivity(posts.length, engagement, sentiment) };
  } catch { return unavailable("error"); }
}

async function fetchReddit(query: string): Promise<SocialSource> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT;
  if (!clientId || !clientSecret || !userAgent) return unavailable("unconfigured");
  try {
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": userAgent }, body: "grant_type=client_credentials", cache: "no-store" });
    if (!tokenResponse.ok) throw new Error(`Reddit auth returned ${tokenResponse.status}`);
    const { access_token } = await tokenResponse.json() as { access_token?: string };
    if (!access_token) throw new Error("Reddit token missing");
    const response = await fetch(`https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=new&t=day&limit=25&type=link`, { headers: { Authorization: `Bearer ${access_token}`, "User-Agent": userAgent }, next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`Reddit returned ${response.status}`);
    const payload = await response.json() as { data?: { children?: Array<{ data?: { title?: string; selftext?: string; score?: number; num_comments?: number } }> } };
    const posts = payload.data?.children ?? [];
    const engagement = posts.reduce((total, post) => total + Math.max(0, post.data?.score ?? 0) + (post.data?.num_comments ?? 0) * 2, 0);
    const sentiment = sentimentOf(posts.map(post => `${post.data?.title ?? ""} ${post.data?.selftext ?? ""}`));
    return { status: "live", mentions: posts.length, engagement, sentiment, score: scoreActivity(posts.length, engagement, sentiment) };
  } catch { return unavailable("error"); }
}

async function fetchDiscord(query: string): Promise<SocialSource> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channels = process.env.DISCORD_CHANNEL_IDS?.split(",").map(value => value.trim()).filter(Boolean) ?? [];
  if (!token || !channels.length) return unavailable("unconfigured");
  try {
    const payloads = await Promise.all(channels.slice(0, 10).map(async channel => {
      const response = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(channel)}/messages?limit=50`, { headers: { Authorization: `Bot ${token}` }, next: { revalidate: 300 } });
      if (!response.ok) throw new Error(`Discord returned ${response.status}`);
      return response.json() as Promise<Array<{ content?: string; reactions?: Array<{ count?: number }> }>>;
    }));
    const needle = query.toLowerCase();
    const messages = payloads.flat().filter(message => message.content?.toLowerCase().includes(needle));
    const engagement = messages.reduce((total, message) => total + (message.reactions ?? []).reduce((sum, reaction) => sum + (reaction.count ?? 0), 0), 0);
    const sentiment = sentimentOf(messages.map(message => message.content ?? ""));
    return { status: "live", mentions: messages.length, engagement, sentiment, score: scoreActivity(messages.length, engagement, sentiment) };
  } catch { return unavailable("error"); }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.replace(/^\$/, "").trim();
  if (!query || query.length > 32) return NextResponse.json({ error: "Pass a token symbol or name in ?q=" }, { status: 400 });
  const [reddit, x, discord] = await Promise.all([fetchReddit(query), fetchX(query), fetchDiscord(query)]);
  const liveScores = [reddit, x, discord].map(source => source.score).filter((score): score is number => score !== null);
  const result: SocialSignal = {
    query,
    score: liveScores.length ? clamp(liveScores.reduce((total, score) => total + score, 0) / liveScores.length) : null,
    mentions: reddit.mentions + x.mentions + discord.mentions,
    sources: { reddit, x, discord },
  };
  return NextResponse.json(result);
}
