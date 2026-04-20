import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { ResumeParsedSchema, type ResumeParsed } from "@/lib/schemas/resume-parsed";

const SYSTEM = `You extract structured data AND clean Markdown from a resume.

Rules:
- NEVER invent facts. If a field isn't in the resume, return an empty string (or empty array for skills/targetRoles).
- For \`markdown\`, use standard headings: # Name, ## Summary, ## Skills, ## Experience, ## Projects, ## Education, ## Certifications.
  - Preserve facts exactly.
  - Use bullet points (- ) for lists. Bold key tech with **double-stars**.
  - Drop boilerplate ("References available on request", page numbers).
- For \`skills\`, extract 8 to 20 top technical skills as short phrases (e.g. "React", "TypeScript", "Next.js").
- For \`targetRoles\`, infer 3 to 5 likely target titles based on the most recent role + stack.
- For \`yearsExperience\`, calculate from earliest-to-latest professional dates if possible; otherwise empty string.
- All URL fields must be full URLs starting with https:// (or empty).`;

/**
 * Convert a PDF resume to structured data + clean markdown via OpenAI.
 * GPT-4o supports PDFs natively via the file content part in AI SDK v6.
 */
export async function parseResumePdfOpenAI(pdfBuffer: Buffer): Promise<ResumeParsed> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: SYSTEM,
    schema: ResumeParsedSchema,
    messages: [
      {
        role: "user",
        content: [
          { type: "file", data: pdfBuffer, mediaType: "application/pdf" },
          { type: "text", text: "Extract structured fields and convert to Markdown per the system rules." },
        ],
      },
    ],
  });
  return object;
}

/**
 * Convert plain-text resume content to structured data + markdown via OpenAI.
 */
export async function parseResumeTextOpenAI(rawText: string): Promise<ResumeParsed> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: SYSTEM,
    schema: ResumeParsedSchema,
    prompt: `Extract structured fields and convert the resume below to Markdown per the system rules.\n\n<resume>\n${rawText}\n</resume>`,
  });
  return object;
}
