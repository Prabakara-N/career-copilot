import { Searcher } from "fast-fuzzy";

export type FuzzyMatchResult = {
  query: string;
  matched: boolean;
  bestMatch: string | null;
  score: number;
};

/**
 * Fuzzy-match each query against the haystack.
 * Returns one result per query. `matched` is true when the best score >= threshold.
 */
export function fuzzyMatchMany(
  queries: readonly string[],
  haystack: readonly string[],
  threshold = 0.72
): FuzzyMatchResult[] {
  const searcher = new Searcher([...haystack], {
    ignoreCase: true,
    ignoreSymbols: true,
    returnMatchData: true,
  });
  return queries.map((query) => {
    const results = searcher.search(query);
    const top = results[0];
    if (!top) {
      return { query, matched: false, bestMatch: null, score: 0 };
    }
    return {
      query,
      matched: top.score >= threshold,
      bestMatch: top.item,
      score: top.score,
    };
  });
}

export function coverageRatio(results: readonly FuzzyMatchResult[]): number {
  if (results.length === 0) return 0;
  const hits = results.filter((r) => r.matched).length;
  return hits / results.length;
}
