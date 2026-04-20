import { perplexityChat, PERPLEXITY_MODELS } from "../perplexity";
import type { PerplexityQueryResult } from "./types";

const SYSTEM = `You research company office locations. Return cited facts only. Use markdown bullets.`;

export async function queryLocations(company: string): Promise<PerplexityQueryResult> {
  try {
    const data = await perplexityChat({
      model: PERPLEXITY_MODELS.large,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Research the physical locations of "${company}".

Return these sections with inline citations [1], [2]:

**HQ** — one line with city and country.
**Offices** — every known office with city, country, and whether it is the HQ. Include satellite offices, engineering hubs, remote-friendly notes.
**Remote policy** — one sentence on remote/hybrid/onsite posture if publicly documented.

Keep total under 300 words.`,
        },
      ],
      temperature: 0.1,
    });
    return {
      label: "locations",
      content: data?.choices?.[0]?.message?.content ?? "",
      citations: Array.isArray(data?.citations) ? data.citations : [],
      ok: true,
    };
  } catch (err) {
    return {
      label: "locations",
      content: "",
      citations: [],
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
