import { z } from "zod";

export const AtsSeverity = z.enum(["critical", "warning", "suggestion"]);
export type AtsSeverity = z.infer<typeof AtsSeverity>;

export const AtsFindingCategory = z.enum([
  "keyword",
  "section",
  "quantification",
  "length",
  "contact",
  "readability",
  "format",
  "relevance",
  "impact",
  "tone",
  "anti-pattern",
]);
export type AtsFindingCategory = z.infer<typeof AtsFindingCategory>;

export const AtsFindingSchema = z.object({
  severity: AtsSeverity,
  category: AtsFindingCategory,
  message: z.string().describe("Short, actionable summary of the issue"),
  evidence: z.string().optional().describe("Quoted text or location where the issue was found"),
  fixHint: z.string().optional().describe("One-line suggestion for how to resolve"),
});
export type AtsFinding = z.infer<typeof AtsFindingSchema>;

const SubScoreSchema = z.object({
  score: z.number().describe("Sub-score 0-100"),
});

export const AtsDeterministicSchema = z.object({
  keywordCoverage: SubScoreSchema.extend({
    matched: z.array(z.string()),
    missing: z.array(z.string()),
  }).nullable(),
  sectionPresence: SubScoreSchema.extend({
    found: z.array(z.string()),
    missing: z.array(z.string()),
  }),
  bulletQuantification: SubScoreSchema.extend({
    quantifiedCount: z.number(),
    totalCount: z.number(),
  }),
  lengthBand: SubScoreSchema.extend({
    wordCount: z.number(),
    band: z.enum(["too-short", "ideal", "too-long"]),
  }),
  contactInfo: SubScoreSchema.extend({
    present: z.array(z.string()),
    missing: z.array(z.string()),
  }),
  readability: SubScoreSchema.extend({
    avgSentenceLen: z.number(),
    passiveVoiceRatio: z.number(),
  }),
  formatSanity: SubScoreSchema.extend({
    notes: z.array(z.string()),
  }),
  subtotal: z.number().describe("Weighted average 0-100"),
});
export type AtsDeterministic = z.infer<typeof AtsDeterministicSchema>;

export const AtsRubricSchema = z.object({
  relevance: SubScoreSchema.extend({ notes: z.string() }),
  impactLanguage: SubScoreSchema.extend({ notes: z.string() }),
  toneSeniority: SubScoreSchema.extend({ notes: z.string() }),
  atsAntiPatterns: SubScoreSchema.extend({ notes: z.string() }),
  subtotal: z.number(),
});
export type AtsRubric = z.infer<typeof AtsRubricSchema>;

export const AtsGrade = z.enum(["A", "B", "C", "D", "F"]);
export type AtsGrade = z.infer<typeof AtsGrade>;

export const AtsMode = z.enum(["jd-targeted", "generic"]);
export type AtsMode = z.infer<typeof AtsMode>;

export const AtsScoreSchema = z.object({
  mode: AtsMode,
  overallScore: z.number().describe("Final 0-100 score"),
  grade: AtsGrade,
  deterministic: AtsDeterministicSchema,
  rubric: AtsRubricSchema.nullable().describe("null if the rubric call failed"),
  findings: z.array(AtsFindingSchema),
  scoredAt: z.string().describe("ISO timestamp"),
  modelUsed: z.string().describe("Model id of the rubric scorer"),
});
export type AtsScore = z.infer<typeof AtsScoreSchema>;

/** Schema used when asking an LLM to produce the rubric — no subtotal (we compute it). */
export const AtsRubricLlmSchema = z.object({
  relevance: SubScoreSchema.extend({ notes: z.string() }),
  impactLanguage: SubScoreSchema.extend({ notes: z.string() }),
  toneSeniority: SubScoreSchema.extend({ notes: z.string() }),
  atsAntiPatterns: SubScoreSchema.extend({ notes: z.string() }),
  extraFindings: z.array(AtsFindingSchema).describe("0-5 findings the LLM wants to add"),
});
export type AtsRubricLlm = z.infer<typeof AtsRubricLlmSchema>;
