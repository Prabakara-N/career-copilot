import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { CvPdfData } from "@/lib/cv/pdf-document";
import { AtsRubricLlmSchema, type AtsFinding, type AtsMode, type AtsRubric } from "@/lib/schemas/ats-score";
import { ATS_RUBRIC_SYSTEM, buildAtsRubricPrompt } from "@/lib/prompts/ats-rubric";

const RUBRIC_MODEL_ID = "claude-haiku-4-5";

export type RubricInput = {
  cv: CvPdfData;
  jdText?: string;
  mode: AtsMode;
};

export type RubricResult = {
  rubric: AtsRubric;
  findings: AtsFinding[];
  modelUsed: string;
};

export async function scoreRubric(input: RubricInput): Promise<RubricResult> {
  const { cv, jdText, mode } = input;
  const { object } = await generateObject({
    model: anthropic(RUBRIC_MODEL_ID),
    system: ATS_RUBRIC_SYSTEM,
    schema: AtsRubricLlmSchema,
    prompt: buildAtsRubricPrompt({ mode, cvJson: JSON.stringify(cv), jdText }),
  });

  const subtotal = Math.round(
    object.relevance.score * 0.35 +
      object.impactLanguage.score * 0.25 +
      object.toneSeniority.score * 0.2 +
      object.atsAntiPatterns.score * 0.2
  );

  return {
    rubric: {
      relevance: object.relevance,
      impactLanguage: object.impactLanguage,
      toneSeniority: object.toneSeniority,
      atsAntiPatterns: object.atsAntiPatterns,
      subtotal,
    },
    findings: object.extraFindings,
    modelUsed: RUBRIC_MODEL_ID,
  };
}
