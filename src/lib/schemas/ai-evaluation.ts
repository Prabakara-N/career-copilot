import { z } from "zod";

/**
 * NOTE: Anthropic's structured-output API does NOT support JSON Schema
 * `minimum`/`maximum` constraints on numbers, or `minItems`/`maxItems` on arrays.
 * Constraints are expressed in `.describe()` strings instead — the model
 * follows them, and downstream code (or a runtime validator) can enforce.
 */

export const BlockSchema = z.object({
  score: z.number().describe("Score from 0 to 5 (decimals allowed, e.g. 4.2)"),
  notes: z.string().describe("1-2 sentences explaining the score, citing specific JD or CV evidence"),
});

export const AiEvaluationSchema = z.object({
  archetype: z.string().describe("Best-fit archetype label, e.g. 'Frontend Engineer (React/Next.js)'"),
  blocks: z.object({
    a_role_fit: BlockSchema,
    b_compensation: BlockSchema,
    c_growth: BlockSchema,
    d_risk: BlockSchema,
    e_culture: BlockSchema,
    f_logistics: BlockSchema,
  }),
  legitimacy: z
    .enum(["High Confidence", "Medium Confidence", "Low Confidence", "Suspicious"])
    .describe("How real and trustworthy the posting appears"),
  legitimacyNotes: z.string().describe("Why you assessed legitimacy this way"),
  overallScore: z.number().describe("Weighted overall score from 0 to 5 (decimals allowed)"),
  verdict: z.enum(["Apply", "Maybe", "Skip"]).describe("Recommended action"),
  reasoning: z.string().describe("2-4 sentences justifying the verdict — be honest and specific"),
  keywords: z
    .array(z.string())
    .describe("5 to 20 top JD keywords for ATS optimization (extract verbatim from the JD)"),
  topGaps: z
    .array(
      z.object({
        gap: z.string().describe("What's missing from the candidate"),
        mitigation: z.string().describe("How to frame around the gap"),
      })
    )
    .describe("Up to 5 honest gaps with mitigation framing"),
  starStories: z
    .array(
      z.object({
        requirement: z.string().describe("JD requirement this story addresses"),
        project: z.string().describe("Which CV project to use"),
        situation: z.string(),
        task: z.string(),
        action: z.string(),
        result: z.string(),
        reflection: z.string().describe("One-line lesson learned"),
      })
    )
    .describe("2 to 3 STAR+R stories drawn from REAL projects in the CV — never invent experience"),
});

export type AiEvaluation = z.infer<typeof AiEvaluationSchema>;
