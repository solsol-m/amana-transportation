import { NextResponse } from "next/server";

const SOURCE_URL = "https://www.amanabootcamp.org/api/fs-classwork-data/amana-transportation";

export const revalidate = 60; // cache at edge for 60s (can be tuned)

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(SOURCE_URL, {
      signal: controller.signal,
      // Prevent stale data while still allowing ISR via route revalidate
      headers: { "cache-control": "no-cache" },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "upstream_error", status: res.status }, { status: 502 });
    }
    const json = await res.json();
    return NextResponse.json(json, { status: 200 });
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "timeout" : "fetch_failed";
    return NextResponse.json({ error: message }, { status: 504 });
  } finally {
    clearTimeout(timeout);
  }
}


