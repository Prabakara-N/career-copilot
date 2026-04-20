import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { FIX_CV_SYSTEM, FixCvResultSchema, buildFixCvPrompt } from "@/lib/prompts/fix-cv";
import { extractJdKeywords } from "./scoring/keywords";
import type { FixCvArgs, FixCvOutput } from "./fix-cv";

const FIX_MODEL_ID = "gpt-4o";

export async function fixCvWithOpenAi(args: FixCvArgs): Promise<FixCvOutput> {
  const jdKeywords = args.jdText ? extractJdKeywords(args.jdText).slice(0, 30) : undefined;
  const { object } = await generateObject({
    model: openai(FIX_MODEL_ID),
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
