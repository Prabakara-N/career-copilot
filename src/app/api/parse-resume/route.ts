import { NextResponse } from "next/server";
import { parseResumePdf, parseResumeText } from "@/lib/ai/parse-resume";
import { parseResumePdfOpenAI, parseResumeTextOpenAI } from "@/lib/ai/openai-parse-resume";
import { requireUidFromRequest } from "@/lib/firebase/require-uid";
import { getAiProvider } from "@/lib/ai/provider";

export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const auth = await requireUidFromRequest(req);
  if (auth.uid === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const filename = file.name.toLowerCase();
    const provider = getAiProvider();

    const isPdf = filename.endsWith(".pdf") || file.type === "application/pdf";
    const isText = filename.endsWith(".txt") || filename.endsWith(".md") || filename.endsWith(".markdown");

    let parsed;
    if (isPdf) {
      parsed = provider === "openai" ? await parseResumePdfOpenAI(buf) : await parseResumePdf(buf);
    } else if (isText) {
      parsed =
        provider === "openai"
          ? await parseResumeTextOpenAI(buf.toString("utf-8"))
          : await parseResumeText(buf.toString("utf-8"));
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF, TXT, or Markdown." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, parsed, provider });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Parse failed" },
      { status: 500 }
    );
  }
}
