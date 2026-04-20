import { z } from "zod";

export const FIX_CV_SYSTEM = `You rewrite a candidate's CV to resolve a list of ATS findings. Strict rules:
- NEVER invent projects, companies, metrics, or years of experience. Work only with the facts in the existing CV.
- You may rephrase, reorder, add keywords from the provided list, tighten language, surface existing metrics more prominently, and split long skill categories.
- Keep the candidate's voice. Don't over-polish into generic corporate-speak.
- Respect the original structure: each experience entry must keep the same company, role, and period. Only bullets change.
- If a JD is provided, pull missing JD keywords into the summary, competencies, or bullets — but only where the candidate plausibly has the experience.
- When a finding asks for missing sections (e.g. "missing Skills"), ADD that section only if you can populate it honestly from the existing CV. Otherwise omit and note in diffSummary.
- diffSummary: short bullet list of the concrete changes you made. One item per change, user-facing.`;

export function buildFixCvPrompt(args: {
  cvJson: string;
  findingsJson: string;
  jdText?: string;
  jdKeywords?: readonly string[];
}): string {
  const jdBlock = args.jdText
    ? `<job-description>\n${args.jdText.slice(0, 8000)}\n</job-description>\n\n`
    : "";
  const kwBlock = args.jdKeywords && args.jdKeywords.length > 0
    ? `<jd-keywords-to-weave-in>\n${args.jdKeywords.slice(0, 30).join(", ")}\n</jd-keywords-to-weave-in>\n\n`
    : "";
  return `${jdBlock}${kwBlock}<current-cv-json>
${args.cvJson}
</current-cv-json>

<ats-findings-to-fix>
${args.findingsJson}
</ats-findings-to-fix>

Return the improved CV (same schema) plus a diffSummary array describing changes.`;
}

/**
 * Schema the LLM returns. CV shape must match CvPdfData. We use a loose schema
 * here (passthrough) and let downstream code validate.
 */
export const FixCvResultSchema = z.object({
  cvData: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    linkedinUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),
    location: z.string().optional(),
    summary: z.string(),
    competencies: z.array(z.string()),
    experience: z.array(
      z.object({
        company: z.string(),
        role: z.string(),
        period: z.string(),
        location: z.string().optional(),
        bullets: z.array(z.string()),
      })
    ),
    projects: z.array(
      z.object({
        title: z.string(),
        url: z.string().optional(),
        description: z.string(),
        tech: z.string(),
      })
    ),
    skills: z.array(z.object({ category: z.string(), items: z.string() })),
    certifications: z.array(
      z.object({
        title: z.string(),
        issuer: z.string(),
        year: z.string(),
        url: z.string().optional(),
      })
    ),
    education: z.array(
      z.object({
        title: z.string(),
        org: z.string(),
        period: z.string(),
        notes: z.string().optional(),
      })
    ),
  }),
  diffSummary: z.array(z.string()).describe("2-8 bullets describing concrete edits made"),
});
export type FixCvResult = z.infer<typeof FixCvResultSchema>;
