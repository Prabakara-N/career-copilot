import { perplexityChat, PERPLEXITY_MODELS } from "../perplexity";
import type { PerplexityQueryResult } from "./types";

const SYSTEM = `You aggregate employee review data from Glassdoor, AmbitionBox, Blind, and Comparably for a job seeker. Return cited facts only. Use markdown bullets.`;

export async function queryReviews(company: string): Promise<PerplexityQueryResult> {
  try {
    const data = await perplexityChat({
      model: PERPLEXITY_MODELS.large,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Research employee reviews for "${company}" across review platforms.

Return these sections with inline citations [1], [2]:

**Glassdoor** — overall rating (X/5), 3-5 common pros, 3-5 common cons, profile URL.
**AmbitionBox** — overall rating, pros, cons, URL (if India presence).
**Blind** — overall sentiment (positive/mixed/negative), 3 top recent threads or talking points, profile URL.
**Comparably** — culture score or rating, URL.
**Summary** — 2-3 sentences aggregating the strongest signals.

If a platform has no data, write "No data" for that section. Never invent ratings.

Keep total under 600 words.`,
        },
      ],
      temperature: 0.1,
    });
    return {
      label: "reviews",
      content: data?.choices?.[0]?.message?.content ?? "",
      citations: Array.isArray(data?.citations) ? data.citations : [],
      ok: true,
    };
  } catch (err) {
    return {
      label: "reviews",
      content: "",
      citations: [],
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
