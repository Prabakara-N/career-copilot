import { perplexityChat, PERPLEXITY_MODELS } from "../perplexity";
import type { PerplexityQueryResult } from "./types";

const SYSTEM = `You research companies for a job seeker. Return concise, cited facts only. Use markdown bullet points.`;

export async function queryOverview(company: string): Promise<PerplexityQueryResult> {
  try {
    const data = await perplexityChat({
      model: PERPLEXITY_MODELS.large,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Research "${company}".

Return these sections with bullet points and inline citations [1], [2]:

**One-liner** — a single sentence describing what they do.
**What they do** — 2-3 sentences on product and market.
**Industry** — a short label (e.g. "Fintech", "HR SaaS", "Consumer social").
**Stage** — one of: seed, series-a, series-b, series-c, growth, public, bootstrapped, unknown.
**Founded year** — a four-digit year or "unknown".
**Last funding** — round label, amount in USD, date, or "unknown".
**Total raised USD** — number or "unknown".
**Leadership** — up to 5 executives with name, role, and a one-line bio.
**Recent news** — up to 5 items from the last 6 months with title, date (YYYY-MM-DD if possible), a one-line summary, and URL.

Keep total under 500 words.`,
        },
      ],
      temperature: 0.1,
    });
    return {
      label: "overview",
      content: data?.choices?.[0]?.message?.content ?? "",
      citations: Array.isArray(data?.citations) ? data.citations : [],
      ok: true,
    };
  } catch (err) {
    return {
      label: "overview",
      content: "",
      citations: [],
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
