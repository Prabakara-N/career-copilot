import { z } from "zod";

export const BlockScoreSchema = z.object({
  score: z.number().min(0).max(5),
  notes: z.string(),
});

export const EvaluationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  company: z.string(),
  role: z.string(),
  jdUrl: z.string().url().optional(),
  jdText: z.string(),
  archetype: z.string(),
  blocks: z.object({
    a_role_fit: BlockScoreSchema,
    b_compensation: BlockScoreSchema,
    c_growth: BlockScoreSchema,
    d_risk: BlockScoreSchema,
    e_culture: BlockScoreSchema,
    f_logistics: BlockScoreSchema,
  }),
  legitimacy: z.enum(["High Confidence", "Medium Confidence", "Low Confidence", "Suspicious"]),
  overallScore: z.number().min(0).max(5),
  verdict: z.enum(["Apply", "Maybe", "Skip"]),
  reasoning: z.string(),
  keywords: z.array(z.string()).default([]),
  starStories: z.array(z.object({
    requirement: z.string(),
    project: z.string(),
    situation: z.string(),
    task: z.string(),
    action: z.string(),
    result: z.string(),
    reflection: z.string(),
  })).default([]),
  createdAt: z.date(),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;
