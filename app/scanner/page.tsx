import { Scanner } from "@/components/scanner";

export default async function ScannerPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <Scanner initialQuery={q.trim()} />;
}
