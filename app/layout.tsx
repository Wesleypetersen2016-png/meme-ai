import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "NexIQ — Decision Intelligence", template: "%s · NexIQ" },
  description: "Goal-aware token momentum, risk, and position intelligence.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "NexIQ",
    description: "Know your next move.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NexIQ decision intelligence dashboard" }],
  },
  twitter: { card: "summary_large_image", title: "NexIQ", description: "Know your next move.", images: ["/og.png"] },
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
