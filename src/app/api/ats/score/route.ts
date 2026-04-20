import { NextResponse } from "next/server";
import { requireUidFromRequest } from "@/lib/firebase/require-uid";
import { computeAtsScore } from "@/lib/ai/scoring";
import { saveAtsRun } from "@/lib/firebase/ats-runs";
import type { CvPdfData } from "@/lib/cv/pdf-document";
import type { AtsMode } from "@/lib/schemas/ats-score";

export const maxDuration = 60;

type ScoreRequestBody = {
  cvData: CvPdfData;
  jdText?: string;
  resumeSource: "profile" | "upload";
};

export async function POST(req: Request) {
  const auth = await requireUidFromRequest(req);
  if (auth.uid === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: ScoreRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.cvData || typeof body.cvData !== "object") {
    return NextResponse.json({ error: "cvData is required" }, { status: 400 });
  }

  const trimmedJd = body.jdText?.trim() ?? "";
  const mode: AtsMode = trimmedJd.length >= 200 ? "jd-targeted" : "generic";

  try {
    const atsScore = await computeAtsScore({
      cv: body.cvData,
      jdText: trimmedJd || undefined,
      mode,
    });
    const runId = await saveAtsRun({
      userId: auth.uid,
      mode,
      resumeSource: body.resumeSource ?? "profile",
      cvData: body.cvData,
      jdText: trimmedJd || null,
      initialScore: atsScore,
    });
    return NextResponse.json({ ok: true, runId, atsScore });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ATS score failed" },
      { status: 500 }
    );
  }
}
