import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { z } from "zod";
import React, { type ReactElement } from "react";
import { CoverLetterPdfDocument } from "@/lib/cv/cover-letter-document";
import { DEFAULT_CV_DATA } from "@/lib/cv/default-cv-data";
import { DEFAULT_USER_CV } from "@/lib/user-cv";

const CoverLetterCopySchema = z.object({
  paragraphs: z.array(z.string()).describe(
    "Exactly 3 to 4 short paragraphs. " +
      "P1: hook — 1-2 sentences naming the role + a specific detail you admire about the company (NEVER generic). " +
      "P2: proof — your most relevant experience with concrete outcomes from the CV. " +
      "P3: alignment — why you're suited to this specific JD (cite 1-2 JD requirements). " +
      "P4 (optional): close — what you'd bring + invitation to connect."
  ),
  signoff: z.string().describe("Closing line, e.g. 'Sincerely,' or 'Best regards,'"),
});

const SYSTEM = `You write tight, specific cover letters. Rules:
- Maximum 220 words across all paragraphs combined.
- NEVER write "I am writing to express my interest" or any cliché opener.
- NEVER invent metrics, projects, or experience. Only refine wording from the CV.
- Cite SPECIFIC JD requirements and SPECIFIC CV achievements.
- No filler words. Every sentence earns its place.
- Match the JD's seniority and tone.`;

export type CoverLetterPdf = { filename: string; base64: string; byteLength: number };

export async function generateCoverLetterOpenAI(args: {
  company: string;
  role: string;
  jdText: string;
}): Promise<CoverLetterPdf> {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    system: SYSTEM,
    schema: CoverLetterCopySchema,
    prompt: `<job-posting>
Company: ${args.company}
Role: ${args.role}

${args.jdText}
</job-posting>

<candidate-cv>
${DEFAULT_USER_CV}
</candidate-cv>

Write a tight, specific cover letter. Return JSON.`,
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const candidate = {
    name: DEFAULT_CV_DATA.name,
    email: DEFAULT_CV_DATA.email,
    phone: DEFAULT_CV_DATA.phone,
    location: DEFAULT_CV_DATA.location,
  };

  const docElement = React.createElement(CoverLetterPdfDocument, {
    data: {
      candidate,
      recipient: { company: args.company, role: args.role },
      date: dateStr,
      paragraphs: object.paragraphs,
      signoff: object.signoff,
    },
  }) as ReactElement<DocumentProps>;
  const pdfBuffer = await renderToBuffer(docElement);

  const slug = `${candidate.name}-${args.company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const isoDate = today.toISOString().slice(0, 10);
  const filename = `cover-${slug}-${isoDate}.pdf`;

  return { filename, base64: pdfBuffer.toString("base64"), byteLength: pdfBuffer.byteLength };
}
