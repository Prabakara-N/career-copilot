import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import {
  CompanyResearchSchema,
  type CompanyResearch,
} from "@/lib/schemas/company-research";
import {
  RESEARCH_NORMALIZE_SYSTEM,
  buildResearchNormalizePrompt,
} from "@/lib/prompts/research-normalize";
import type { PerplexityQueryResult } from "./types";

const NORMALIZER_MODEL = "claude-sonnet-4-5";

export type NormalizeInput = {
  companyName: string;
  companySlug: string;
  overview: PerplexityQueryResult;
  headcount: PerplexityQueryResult;
  locations: PerplexityQueryResult;
  reviews: PerplexityQueryResult;
  perplexityModel: string;
  ttlDays: number;
};

export async function normalizeResearch(input: NormalizeInput): Promise<CompanyResearch> {
  const merged = dedupeCitations([
    ...input.overview.citations,
    ...input.headcount.citations,
    ...input.locations.citations,
    ...input.reviews.citations,
  ]);

  const { object } = await generateObject({
    model: anthropic(NORMALIZER_MODEL),
    system: RESEARCH_NORMALIZE_SYSTEM,
    schema: CompanyResearchSchema,
    prompt: buildResearchNormalizePrompt({
      companyName: input.companyName,
      companySlug: input.companySlug,
      overview: input.overview.content,
      headcount: input.headcount.content,
      locations: input.locations.content,
      reviews: input.reviews.content,
      mergedCitations: merged,
      ttlDays: input.ttlDays,
      perplexityModel: input.perplexityModel,
      queriesOk: {
        overview: input.overview.ok,
        headcount: input.headcount.ok,
        locations: input.locations.ok,
        reviews: input.reviews.ok,
      },
    }),
  });

  return {
    ...object,
    companySlug: input.companySlug,
    companyName: input.companyName,
    citations: merged,
    fetchedAt: new Date().toISOString(),
    ttlDays: input.ttlDays,
    modelTrace: {
      perplexityModel: input.perplexityModel,
      normalizerModel: NORMALIZER_MODEL,
      queries: {
        overview: input.overview.ok,
        headcount: input.headcount.ok,
        locations: input.locations.ok,
        reviews: input.reviews.ok,
      },
    },
  };
}

function dedupeCitations(list: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of list) {
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}
