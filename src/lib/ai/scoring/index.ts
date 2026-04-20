import type { CvPdfData } from "@/lib/cv/pdf-document";
import type { AtsFinding, AtsGrade, AtsMode, AtsScore } from "@/lib/schemas/ats-score";
import { scoreDeterministic } from "./deterministic";
import { scoreRubric } from "./rubric";

const DETERMINISTIC_WEIGHT = 0.7;
const RUBRIC_WEIGHT = 0.3;

export type ComputeAtsScoreInput = {
  cv: CvPdfData;
  jdText?: string;
  seedKeywords?: readonly string[];
  /**
   * Force a mode. If omitted, mode is inferred from jdText presence/length.
   */
  mode?: AtsMode;
};

export async function computeAtsScore(input: ComputeAtsScoreInput): Promise<AtsScore> {
  const mode: AtsMode = input.mode ?? (input.jdText && input.jdText.trim().length >= 200 ? "jd-targeted" : "generic");

  const det = scoreDeterministic({
    cv: input.cv,
    jdText: input.jdText,
    seedKeywords: input.seedKeywords,
    mode,
  });

  let rubric: AtsScore["rubric"] = null;
  let rubricFindings: AtsFinding[] = [];
  let modelUsed = "claude-haiku-4-5";

  try {
    const rubricResult = await scoreRubric({ cv: input.cv, jdText: input.jdText, mode });
    rubric = rubricResult.rubric;
    rubricFindings = rubricResult.findings;
    modelUsed = rubricResult.modelUsed;
  } catch (err) {
    rubricFindings = [
      {
        severity: "suggestion",
        category: "format",
        message: "Rubric scorer unavailable — relying on deterministic score only.",
        evidence: err instanceof Error ? err.message : "Unknown error",
      },
    ];
  }

  const overallScore =
    rubric === null
      ? det.scores.subtotal
      : Math.round(det.scores.subtotal * DETERMINISTIC_WEIGHT + rubric.subtotal * RUBRIC_WEIGHT);

  const findings = dedupeFindings([...det.findings, ...rubricFindings]);

  return {
    mode,
    overallScore,
    grade: gradeFor(overallScore),
    deterministic: det.scores,
    rubric,
    findings,
    scoredAt: new Date().toISOString(),
    modelUsed,
  };
}

function gradeFor(score: number): AtsGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function dedupeFindings(findings: readonly AtsFinding[]): AtsFinding[] {
  const seen = new Set<string>();
  const out: AtsFinding[] = [];
  for (const f of findings) {
    const key = `${f.category}|${f.message.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return sortFindings(out);
}

const SEVERITY_ORDER: Record<AtsFinding["severity"], number> = {
  critical: 0,
  warning: 1,
  suggestion: 2,
};

function sortFindings(findings: readonly AtsFinding[]): AtsFinding[] {
  return [...findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
