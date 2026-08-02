"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <section className="panel mx-auto max-w-2xl p-8 text-center md:p-12"><div className="eyebrow">Something interrupted NexIQ</div><h1 className="mt-3 text-2xl font-semibold">The workspace could not finish loading.</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#858b96]">Your saved profile and positions are still on this device. Retry the page; no trade or wallet action was attempted.</p><Button className="mt-6" onClick={reset}>Try again</Button></section>;
}
