export const RESEARCH_NORMALIZE_SYSTEM = `You transform four blocks of markdown research (overview, headcount, locations, reviews) about a company into a single structured JSON object.

Rules:
- Never invent data. If a field was not reported, return null, empty array, or the "unknown" enum value.
- For stage, use exactly one of: seed, series-a, series-b, series-c, growth, public, bootstrapped, unknown.
- For headcountBand, use exactly one of: "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001+".
- For blind.sentiment, use exactly one of: positive, mixed, negative, unknown.
- URLs must be full https:// URLs. If none, return null.
- foundedYear, amountUsd, totalRaisedUsd, estimatedHeadcount, approxSize, rating, cultureScore: numbers or null.
- dates: ISO-format strings (YYYY-MM-DD) or null.
- recentNews and openRoles: cap at the schema limits if more exist, pick the most important.
- reviews.summary: 2-3 sentences merging signals across platforms.`;

export function buildResearchNormalizePrompt(args: {
  companyName: string;
  companySlug: string;
  overview: string;
  headcount: string;
  locations: string;
  reviews: string;
  mergedCitations: string[];
  ttlDays: number;
  perplexityModel: string;
  queriesOk: { overview: boolean; headcount: boolean; locations: boolean; reviews: boolean };
}): string {
  return `Company: ${args.companyName} (slug: ${args.companySlug})

<overview-block>
${args.overview || "NO DATA"}
</overview-block>

<headcount-block>
${args.headcount || "NO DATA"}
</headcount-block>

<locations-block>
${args.locations || "NO DATA"}
</locations-block>

<reviews-block>
${args.reviews || "NO DATA"}
</reviews-block>

<citations>
${args.mergedCitations.join("\n")}
</citations>

<metadata>
fetchedAt (use now): ${new Date().toISOString()}
ttlDays: ${args.ttlDays}
perplexityModel: ${args.perplexityModel}
normalizerModel: claude-sonnet-4-5
queries.overview: ${args.queriesOk.overview}
queries.headcount: ${args.queriesOk.headcount}
queries.locations: ${args.queriesOk.locations}
queries.reviews: ${args.queriesOk.reviews}
</metadata>

Produce JSON matching the CompanyResearch schema. Use the exact companySlug and companyName provided.`;
}
