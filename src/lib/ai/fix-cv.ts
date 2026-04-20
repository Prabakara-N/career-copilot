import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { CvPdfData } from "@/lib/cv/pdf-document";
import type { AtsFinding } from "@/lib/schemas/ats-score";
import { FIX_CV_SYSTEM, FixCvResultSchema, buildFixCvPrompt } from "@/lib/prompts/fix-cv";
import { extractJdKeywords } from "./scoring/keywords";

export type FixCvArgs = {
  cv: CvPdfData;
  findings: readonly AtsFinding[];
  jdText?: string;
};

export type FixCvOutput = {
  cvData: CvPdfData;
  diffSummary: string[];
  modelUsed: string;
};

const FIX_MODEL_ID = "claude-sonnet-4-5";

export async function fixCvWithAi(args: FixCvArgs): Promise<FixCvOutput> {
  const jdKeywords = args.jdText ? extractJdKeywords(args.jdText).slice(0, 30) : undefined;
  const { object } = await generateObject({
    model: anthropic(FIX_MODEL_ID),
    system: FIX_CV_SYSTEM,
    schema: FixCvResultSchema,
    prompt: buildFixCvPrompt({
      cvJson: JSON.stringify(args.cv),
      findingsJson: JSON.stringify(args.findings),
      jdText: args.jdText,
      jdKeywords,
    }),
  });
  return {
    cvData: object.cvData,
    diffSummary: object.diffSummary,
    modelUsed: FIX_MODEL_ID,
  };
}
