import { perplexityChat, PERPLEXITY_MODELS } from "../perplexity";
import type { PerplexityQueryResult } from "./types";

const SYSTEM = `You research company sizing and org structure for a job seeker. Return cited facts only. Use markdown bullets.`;

export async function queryHeadcount(company: string): Promise<PerplexityQueryResult> {
  try {
    const data = await perplexityChat({
      model: PERPLEXITY_MODELS.large,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Research the people structure of "${company}".

Return these sections with inline citations [1], [2]:

**Estimated headcount** — a single number or range, cite LinkedIn/Crunchbase/official sources.
**Headcount band** — one of: 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001+.
**Departments** — list the main departments or functions (Engineering, Product, Design, Sales, etc.) with approximate size if known.
**Open roles** — up to 20 currently posted job titles with department and location. Use careers page, LinkedIn, or ATS listings.

Keep total under 400 words.`,
        },
      ],
      temperature: 0.1,
    });
    return {
      label: "headcount",
      content: data?.choices?.[0]?.message?.content ?? "",
      citations: Array.isArray(data?.citations) ? data.citations : [],
      ok: true,
    };
  } catch (err) {
    return {
      label: "headcount",
      content: "",
      citations: [],
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
