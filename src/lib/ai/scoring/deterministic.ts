import type { CvPdfData } from "@/lib/cv/pdf-document";
import type {
  AtsDeterministic,
  AtsFinding,
  AtsMode,
} from "@/lib/schemas/ats-score";
import { computeKeywordCoverage, flattenCvCorpus, type KeywordCoverage } from "./keywords";

const REQUIRED_SECTIONS = ["summary", "experience", "skills", "education"];
const OPTIONAL_SECTIONS = ["competencies", "projects", "certifications"];
const REQUIRED_CONTACT = ["email"];
const OPTIONAL_CONTACT = ["phone", "linkedinUrl", "portfolioUrl", "location"];

const QUANTIFIER_RE = /\b(\d+[%+]?|\d+\.?\d*(k|m|x|\+)?|\$\d+|\d+(st|nd|rd|th)|₹?\d+(,\d{3})+)\b/i;
const PASSIVE_RE = /\b(was|were|been|being|is|are)\s+\w+ed\b/gi;

const SUB_WEIGHTS = {
  keywordCoverage: 0.30,
  sectionPresence: 0.15,
  bulletQuantification: 0.15,
  lengthBand: 0.10,
  contactInfo: 0.10,
  readability: 0.10,
  formatSanity: 0.10,
};

export type DeterministicInput = {
  cv: CvPdfData;
  jdText?: string;
  seedKeywords?: readonly string[];
  mode: AtsMode;
};

export type DeterministicResult = {
  scores: AtsDeterministic;
  findings: AtsFinding[];
};

export function scoreDeterministic(input: DeterministicInput): DeterministicResult {
  const { cv, jdText, seedKeywords, mode } = input;
  const findings: AtsFinding[] = [];

  const keywordCoverage = scoreKeywords(cv, jdText, seedKeywords, mode, findings);
  const sectionPresence = scoreSections(cv, findings);
  const bulletQuantification = scoreQuantification(cv, findings);
  const lengthBand = scoreLength(cv, findings);
  const contactInfo = scoreContact(cv, findings);
  const readability = scoreReadability(cv, findings);
  const formatSanity = scoreFormatSanity(cv, findings);

  const subtotal = computeSubtotal(
    { keywordCoverage, sectionPresence, bulletQuantification, lengthBand, contactInfo, readability, formatSanity },
    mode
  );

  return {
    scores: {
      keywordCoverage,
      sectionPresence,
      bulletQuantification,
      lengthBand,
      contactInfo,
      readability,
      formatSanity,
      subtotal,
    },
    findings,
  };
}

function scoreKeywords(
  cv: CvPdfData,
  jdText: string | undefined,
  seedKeywords: readonly string[] | undefined,
  mode: AtsMode,
  findings: AtsFinding[]
): AtsDeterministic["keywordCoverage"] {
  if (mode === "generic" || !jdText || jdText.trim().length < 200) {
    return null;
  }
  const coverage: KeywordCoverage = computeKeywordCoverage(jdText, cv, { seedKeywords });
  if (coverage.score < 40) {
    findings.push({
      severity: "critical",
      category: "keyword",
      message: `Low JD keyword coverage (${coverage.score}%). Your CV is missing terms hiring managers search for.`,
      evidence: coverage.missing.slice(0, 8).join(", "),
      fixHint: "Weave missing JD terms into your summary and bullets where you genuinely have the experience.",
    });
  } else if (coverage.score < 65) {
    findings.push({
      severity: "warning",
      category: "keyword",
      message: `Keyword coverage is ${coverage.score}%. A few JD terms aren't reflected in your CV.`,
      evidence: coverage.missing.slice(0, 5).join(", "),
      fixHint: "Inject missing terms in a skills row or summary sentence if true.",
    });
  }
  return coverage;
}

function scoreSections(cv: CvPdfData, findings: AtsFinding[]): AtsDeterministic["sectionPresence"] {
  const found: string[] = [];
  const missing: string[] = [];
  const present: Record<string, boolean> = {
    summary: !!cv.summary?.trim(),
    competencies: cv.competencies.length > 0,
    experience: cv.experience.length > 0,
    projects: cv.projects.length > 0,
    skills: cv.skills.length > 0,
    certifications: cv.certifications.length > 0,
    education: cv.education.length > 0,
  };
  for (const sec of REQUIRED_SECTIONS) {
    if (present[sec]) found.push(sec);
    else missing.push(sec);
  }
  for (const sec of OPTIONAL_SECTIONS) {
    if (present[sec]) found.push(sec);
  }

  const requiredHit = REQUIRED_SECTIONS.filter((s) => present[s]).length;
  const score = Math.round((requiredHit / REQUIRED_SECTIONS.length) * 100);
  for (const sec of missing) {
    findings.push({
      severity: "critical",
      category: "section",
      message: `Missing required section: ${sec}.`,
      fixHint: `Add a ${sec} section — ATS parsers look for it explicitly.`,
    });
  }
  return { score, found, missing };
}

function scoreQuantification(cv: CvPdfData, findings: AtsFinding[]): AtsDeterministic["bulletQuantification"] {
  const bullets: string[] = [];
  for (const job of cv.experience) bullets.push(...job.bullets);
  if (bullets.length === 0) {
    return { score: 0, quantifiedCount: 0, totalCount: 0 };
  }
  const quantified = bullets.filter((b) => QUANTIFIER_RE.test(b)).length;
  const ratio = quantified / bullets.length;
  const score = Math.round(ratio * 100);
  if (ratio < 0.3) {
    findings.push({
      severity: "warning",
      category: "quantification",
      message: `Only ${quantified}/${bullets.length} bullets include numbers. Quantified impact is a strong ATS/recruiter signal.`,
      fixHint: "Add concrete metrics (users, %, hours saved, latency, scope) to at least half your bullets.",
    });
  }
  return { score, quantifiedCount: quantified, totalCount: bullets.length };
}

function scoreLength(cv: CvPdfData, findings: AtsFinding[]): AtsDeterministic["lengthBand"] {
  const words = countWords(cv);
  let band: "too-short" | "ideal" | "too-long";
  let score: number;
  if (words < 250) {
    band = "too-short";
    score = Math.round((words / 250) * 60);
    findings.push({
      severity: "warning",
      category: "length",
      message: `CV is short (~${words} words). Aim for 400-800 words for a 1-page resume.`,
    });
  } else if (words > 1100) {
    band = "too-long";
    score = Math.max(50, 100 - Math.round((words - 1100) / 20));
    findings.push({
      severity: "suggestion",
      category: "length",
      message: `CV is long (~${words} words). Trim to 1-2 pages for most roles.`,
    });
  } else {
    band = "ideal";
    score = 100;
  }
  return { score, wordCount: words, band };
}

function scoreContact(cv: CvPdfData, findings: AtsFinding[]): AtsDeterministic["contactInfo"] {
  const present: string[] = [];
  const missing: string[] = [];
  const values: Record<string, string | undefined> = {
    email: cv.email,
    phone: cv.phone,
    linkedinUrl: cv.linkedinUrl,
    portfolioUrl: cv.portfolioUrl,
    location: cv.location,
  };
  for (const key of REQUIRED_CONTACT) {
    if (values[key]?.trim()) present.push(key);
    else {
      missing.push(key);
      findings.push({
        severity: "critical",
        category: "contact",
        message: `Missing contact field: ${key}.`,
        fixHint: "ATS parsers key off email — recruiters can't reach you without one.",
      });
    }
  }
  for (const key of OPTIONAL_CONTACT) {
    if (values[key]?.trim()) present.push(key);
    else missing.push(key);
  }
  const requiredHit = REQUIRED_CONTACT.filter((k) => values[k]?.trim()).length;
  const optionalHit = OPTIONAL_CONTACT.filter((k) => values[k]?.trim()).length;
  const score = Math.round(
    ((requiredHit / REQUIRED_CONTACT.length) * 70) +
      ((optionalHit / OPTIONAL_CONTACT.length) * 30)
  );
  return { score, present, missing };
}

function scoreReadability(cv: CvPdfData, findings: AtsFinding[]): AtsDeterministic["readability"] {
  const corpus = flattenCvCorpus(cv).join(" ");
  const sentences = corpus.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 4);
  const avgLen = sentences.length === 0
    ? 0
    : sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  const passiveMatches = corpus.match(PASSIVE_RE)?.length ?? 0;
  const totalSentences = Math.max(1, sentences.length);
  const passiveRatio = passiveMatches / totalSentences;

  let score = 100;
  if (avgLen > 28) {
    score -= 20;
    findings.push({
      severity: "suggestion",
      category: "readability",
      message: `Average sentence length is ${Math.round(avgLen)} words — tighten for scannability.`,
    });
  } else if (avgLen < 6) {
    score -= 10;
  }
  if (passiveRatio > 0.25) {
    score -= 20;
    findings.push({
      severity: "suggestion",
      category: "readability",
      message: "Heavy passive voice. Recruiters skim faster with active verbs ('Built', 'Shipped', 'Led').",
    });
  }
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    avgSentenceLen: Math.round(avgLen * 10) / 10,
    passiveVoiceRatio: Math.round(passiveRatio * 100) / 100,
  };
}

function scoreFormatSanity(cv: CvPdfData, findings: AtsFinding[]): AtsDeterministic["formatSanity"] {
  const notes: string[] = [];
  let score = 100;
  if (cv.competencies.length > 12) {
    notes.push("Core competencies list is long — recruiters tune out past ~8-10.");
    findings.push({
      severity: "suggestion",
      category: "format",
      message: "Core competencies list exceeds 12. Focus on 6-10 differentiating items.",
    });
    score -= 10;
  }
  if (cv.experience.length === 0) {
    notes.push("No experience entries.");
    score -= 40;
  }
  if (cv.skills.some((s) => s.items.length > 180)) {
    notes.push("One skill category is very long — break into two rows.");
    score -= 5;
  }
  score = Math.max(0, Math.min(100, score));
  return { score, notes };
}

function countWords(cv: CvPdfData): number {
  return flattenCvCorpus(cv).join(" ").split(/\s+/).filter(Boolean).length;
}

function computeSubtotal(
  scores: Omit<AtsDeterministic, "subtotal">,
  mode: AtsMode
): number {
  if (mode === "generic" || !scores.keywordCoverage) {
    const total =
      scores.sectionPresence.score * 0.22 +
      scores.bulletQuantification.score * 0.22 +
      scores.lengthBand.score * 0.14 +
      scores.contactInfo.score * 0.14 +
      scores.readability.score * 0.14 +
      scores.formatSanity.score * 0.14;
    return Math.round(total);
  }
  const total =
    (scores.keywordCoverage?.score ?? 0) * SUB_WEIGHTS.keywordCoverage +
    scores.sectionPresence.score * SUB_WEIGHTS.sectionPresence +
    scores.bulletQuantification.score * SUB_WEIGHTS.bulletQuantification +
    scores.lengthBand.score * SUB_WEIGHTS.lengthBand +
    scores.contactInfo.score * SUB_WEIGHTS.contactInfo +
    scores.readability.score * SUB_WEIGHTS.readability +
    scores.formatSanity.score * SUB_WEIGHTS.formatSanity;
  return Math.round(total);
}
