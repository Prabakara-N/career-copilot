import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { DEFAULT_CV_DATA } from "@/lib/cv/default-cv-data";
import type { CvPdfData } from "@/lib/cv/pdf-document";
import { renderTailoredCvPdf } from "@/lib/cv/render-pdf";
import {
  TAILOR_CV_SYSTEM,
  TailoredCopySchema,
  buildTailorCvPrompt,
  type TailoredCopy,
} from "@/lib/prompts/tailor-cv";
import { computeAtsScore } from "@/lib/ai/scoring";
import type { TailoredCv } from "./tailor-cv";

export async function generateTailoredCvDataOpenAI(args: {
  company: string;
  role: string;
  jdText: string;
}): Promise<{ cvData: CvPdfData; tailoredCopy: TailoredCopy }> {
  const { object: tailored } = await generateObject({
    model: openai("gpt-4o-mini"),
    system: TAILOR_CV_SYSTEM,
    schema: TailoredCopySchema,
    prompt: buildTailorCvPrompt({
      company: args.company,
      role: args.role,
      jdText: args.jdText,
      currentSummary: DEFAULT_CV_DATA.summary,
      currentBullets: DEFAULT_CV_DATA.experience[0].bullets,
    }),
  });

  const cvData: CvPdfData = {
    ...DEFAULT_CV_DATA,
    summary: tailored.summary,
    competencies: tailored.competencies,
    experience: [
      { ...DEFAULT_CV_DATA.experience[0], bullets: tailored.experienceBullets },
      ...DEFAULT_CV_DATA.experience.slice(1),
    ],
  };

  return { cvData, tailoredCopy: tailored };
}

export async function tailorCvForJdOpenAI(args: {
  company: string;
  role: string;
  jdText: string;
  seedKeywords?: readonly string[];
}): Promise<TailoredCv> {
  const { cvData } = await generateTailoredCvDataOpenAI(args);
  const [rendered, atsScore] = await Promise.all([
    renderTailoredCvPdf({ cvData, company: args.company }),
    computeAtsScore({
      cv: cvData,
      jdText: args.jdText,
      seedKeywords: args.seedKeywords,
      mode: "jd-targeted",
    }),
  ]);
  return { ...rendered, atsScore };
}
