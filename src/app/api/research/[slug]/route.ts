import { NextResponse } from "next/server";
import { requireUidFromRequest } from "@/lib/firebase/require-uid";
import { researchCompanyStructured } from "@/lib/ai/research/orchestrator";
import { getCachedResearch } from "@/lib/firebase/company-research";
import { checkRateLimit } from "@/lib/throttle";

export const maxDuration = 90;

const COMPANY_HEADER = "x-company-name";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const companyName = req.headers.get(COMPANY_HEADER) ?? decodeSlugToName(slug);
  try {
    const cached = await getCachedResearch(slug);
    if (cached) {
      const { _cachedAt: _discard, ...rest } = cached;
      void _discard;
      return NextResponse.json({ ok: true, source: "cache", data: rest });
    }
    const result = await researchCompanyStructured({ companyName });
    return NextResponse.json({ ok: true, source: result.source, data: result.data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Research failed" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await requireUidFromRequest(req);
  if (auth.uid === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const limit = checkRateLimit(`research-refresh:${auth.uid}`, 3, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${limit.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const { slug } = await context.params;
  let body: { companyName?: string } = {};
  try {
    body = await req.json();
  } catch {
    // body is optional on refresh
  }
  const companyName = body.companyName ?? decodeSlugToName(slug);
  try {
    const result = await researchCompanyStructured({ companyName, force: true });
    return NextResponse.json({ ok: true, source: "fresh", data: result.data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Research failed" },
      { status: 500 }
    );
  }
}

function decodeSlugToName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
