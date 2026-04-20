import { NextResponse } from "next/server";
import { requireUidFromRequest } from "@/lib/firebase/require-uid";
import { getAiProvider } from "@/lib/ai/provider";
import { fixCvWithAi } from "@/lib/ai/fix-cv";
import { fixCvWithOpenAi } from "@/lib/ai/openai-fix-cv";
import { computeAtsScore } from "@/lib/ai/scoring";
import { attachFixToRun, getAtsRun } from "@/lib/firebase/ats-runs";
import { checkRateLimit } from "@/lib/throttle";
import type { AtsMode } from "@/lib/schemas/ats-score";

export const maxDuration = 90;

export async function POST(req: Request) {
  const auth = await requireUidFromRequest(req);
  if (auth.uid === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const limit = checkRateLimit(`ats-fix:${auth.uid}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${limit.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  let body: { runId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  const run = await getAtsRun(auth.uid, body.runId);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  try {
    const fixFn = getAiProvider() === "openai" ? fixCvWithOpenAi : fixCvWithAi;
    const fixOutput = await fixFn({
      cv: run.input.cvData,
      findings: run.initialScore.findings,
      jdText: run.input.jdText ?? undefined,
    });

    const mode: AtsMode = run.mode;
    const rescored = await computeAtsScore({
      cv: fixOutput.cvData,
      jdText: run.input.jdText ?? undefined,
      mode,
    });

    await attachFixToRun({
      userId: auth.uid,
      runId: body.runId,
      cvData: fixOutput.cvData,
      diffSummary: fixOutput.diffSummary,
      score: rescored,
    });

    return NextResponse.json({
      ok: true,
      cvData: fixOutput.cvData,
      diffSummary: fixOutput.diffSummary,
      atsScore: rescored,
      modelUsed: fixOutput.modelUsed,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fix-with-AI failed" },
      { status: 500 }
    );
  }
}
