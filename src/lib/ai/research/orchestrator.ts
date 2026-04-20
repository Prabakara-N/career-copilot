import { PERPLEXITY_MODELS } from "../perplexity";
import type { CompanyResearch } from "@/lib/schemas/company-research";
import {
  companyResearchSlug,
  defaultTtlDays,
  getCachedResearch,
  isFresh,
  upsertCachedResearch,
} from "@/lib/firebase/company-research";
import { queryOverview } from "./overview";
import { queryHeadcount } from "./headcount";
import { queryLocations } from "./locations";
import { queryReviews } from "./reviews";
import { normalizeResearch } from "./normalize";

export type OrchestratorResult = {
  data: CompanyResearch;
  source: "cache" | "fresh";
};

/**
 * Cache-first research. Returns cached data if within TTL, otherwise fans out
 * to Perplexity in parallel, normalizes with Claude, and persists the result.
 */
export async function researchCompanyStructured(args: {
  companyName: string;
  force?: boolean;
}): Promise<OrchestratorResult> {
  const slug = companyResearchSlug(args.companyName);
  const ttlDays = defaultTtlDays();

  if (!args.force) {
    const cached = await getCachedResearch(slug);
    if (cached && isFresh(cached.fetchedAt, cached.ttlDays)) {
      return { data: stripCacheMeta(cached), source: "cache" };
    }
  }

  const [overview, headcount, locations, reviews] = await Promise.all([
    queryOverview(args.companyName),
    queryHeadcount(args.companyName),
    queryLocations(args.companyName),
    queryReviews(args.companyName),
  ]);

  const fresh = await normalizeResearch({
    companyName: args.companyName,
    companySlug: slug,
    overview,
    headcount,
    locations,
    reviews,
    perplexityModel: PERPLEXITY_MODELS.large,
    ttlDays,
  });

  // Write through even on partial failures — future requests hit cache.
  await upsertCachedResearch(slug, fresh);

  return { data: fresh, source: "fresh" };
}

function stripCacheMeta(record: CompanyResearch & { _cachedAt?: unknown }): CompanyResearch {
  // _cachedAt is a Firestore Timestamp meta-field we don't need on the wire.
  const { _cachedAt: _discard, ...rest } = record;
  void _discard;
  return rest;
}
