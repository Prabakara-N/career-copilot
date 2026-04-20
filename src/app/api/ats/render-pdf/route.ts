import { NextResponse } from "next/server";
import { requireUidFromRequest } from "@/lib/firebase/require-uid";
import { renderTailoredCvPdf } from "@/lib/cv/render-pdf";
import type { CvPdfData } from "@/lib/cv/pdf-document";

export const maxDuration = 60;

type RenderRequestBody = {
  cvData: CvPdfData;
  company?: string;
};

export async function POST(req: Request) {
  const auth = await requireUidFromRequest(req);
  if (auth.uid === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: RenderRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.cvData) {
    return NextResponse.json({ error: "cvData is required" }, { status: 400 });
  }

  try {
    const rendered = await renderTailoredCvPdf({
      cvData: body.cvData,
      company: body.company ?? "ats",
    });
    return NextResponse.json({
      ok: true,
      filename: rendered.filename,
      base64: rendered.base64,
      byteLength: rendered.byteLength,
      mimeType: "application/pdf",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF render failed" },
      { status: 500 }
    );
  }
}
