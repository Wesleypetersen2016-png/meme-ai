import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Meme AI — Token Intelligence", template: "%s · Meme AI" },
  description: "AI-powered meme token discovery, scoring, and portfolio intelligence.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Meme AI",
    description: "Signal before the crowd.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Meme AI token intelligence dashboard" }],
  },
  twitter: { card: "summary_large_image", title: "Meme AI", description: "Signal before the crowd.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
