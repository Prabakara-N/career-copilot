import { extractKeyPhrases } from "@/lib/text/tokenize";
import { coverageRatio, fuzzyMatchMany } from "@/lib/text/fuzzy-match";
import type { CvPdfData } from "@/lib/cv/pdf-document";

export type KeywordCoverage = {
  score: number;
  matched: string[];
  missing: string[];
};

/**
 * Flatten a CV into a searchable corpus of tokens/phrases.
 * We index: summary, competencies, experience bullets, projects, skills.
 */
export function flattenCvCorpus(cv: CvPdfData): string[] {
  const parts: string[] = [];
  parts.push(cv.summary);
  parts.push(...cv.competencies);
  for (const job of cv.experience) {
    parts.push(job.role, job.company);
    parts.push(...job.bullets);
  }
  for (const project of cv.projects) {
    parts.push(project.title, project.description, project.tech);
  }
  for (const skill of cv.skills) {
    parts.push(skill.category, skill.items);
  }
  return parts.filter(Boolean);
}

export type KeywordExtractionOptions = {
  seedKeywords?: readonly string[];
  maxPhrases?: number;
};

/**
 * Pull candidate ATS keywords out of a JD. Callers can pass a seed list
 * (e.g. the `keywords` field already surfaced by evaluate_job) — we merge
 * seeds with extracted phrases and dedupe.
 */
export function extractJdKeywords(jdText: string, opts: KeywordExtractionOptions = {}): string[] {
  const { seedKeywords = [], maxPhrases = 40 } = opts;
  const phrases = extractKeyPhrases(jdText, maxPhrases);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...seedKeywords, ...phrases]) {
    const norm = raw.trim().toLowerCase();
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

/**
 * Compute keyword coverage 0-100. `matched` and `missing` use the original
 * JD-facing spelling so UI can show them to the user.
 */
export function computeKeywordCoverage(
  jdText: string,
  cv: CvPdfData,
  opts: KeywordExtractionOptions = {}
): KeywordCoverage {
  const jdKeywords = extractJdKeywords(jdText, opts);
  if (jdKeywords.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }
  const haystack = flattenCvCorpus(cv).map((s) => s.toLowerCase());
  const results = fuzzyMatchMany(jdKeywords, haystack, 0.72);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const r of results) {
    if (r.matched) matched.push(r.query);
    else missing.push(r.query);
  }
  const score = Math.round(coverageRatio(results) * 100);
  return { score, matched, missing };
}
