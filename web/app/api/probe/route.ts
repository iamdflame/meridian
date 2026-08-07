import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Server-side probe for a running Meridian server — keeps the browser console clean. */
export async function GET() {
  const base = process.env.MERIDIAN_SERVER ?? "http://127.0.0.1:8787";
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 1500);
    const res = await fetch(`${base}/api/status`, { signal: ac.signal, cache: "no-store" });
    clearTimeout(t);
    return NextResponse.json({ server: res.ok });
  } catch {
    return NextResponse.json({ server: false });
  }
}
