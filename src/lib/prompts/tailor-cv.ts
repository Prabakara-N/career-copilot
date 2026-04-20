export const TAILOR_CV_SYSTEM = `You rewrite a candidate's CV summary, core competencies, and experience bullets to maximize relevance to a specific JD. Rules:
- NEVER invent metrics, projects, or experience. Only refine wording.
- Inject JD keywords naturally — don't keyword-stuff.
- Keep bullets concrete and outcome-oriented.
- Match the JD's seniority framing.`;

export function buildTailorCvPrompt(args: {
  company: string;
  role: string;
  jdText: string;
  currentSummary: string;
  currentBullets: readonly string[];
}): string {
  return `<job-posting>
Company: ${args.company}
Role: ${args.role}

${args.jdText}
</job-posting>

<current-summary>
${args.currentSummary}
</current-summary>

<current-bullets>
${args.currentBullets.map((b) => `- ${b}`).join("\n")}
</current-bullets>

Return tailored summary, 6-8 core competencies, and 3-6 refined experience bullets.`;
}

import { z } from "zod";
export const TailoredCopySchema = z.object({
  summary: z
    .string()
    .describe("A 3-4 sentence professional summary tailored to the JD. Inject 4-6 keywords naturally. Never invent experience."),
  competencies: z
    .array(z.string())
    .describe("Exactly 6 to 8 short core-competency phrases reflecting the JD's qualifications"),
  experienceBullets: z
    .array(z.string())
    .describe("3 to 6 reordered/refined bullet points for the current role — keep facts; sharpen wording for the JD"),
});
export type TailoredCopy = z.infer<typeof TailoredCopySchema>;
