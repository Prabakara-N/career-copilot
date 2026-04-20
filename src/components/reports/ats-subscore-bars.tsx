import type { AtsDeterministic, AtsRubric } from "@/lib/schemas/ats-score";

interface AtsSubscoreBarsProps {
  deterministic: AtsDeterministic;
  rubric: AtsRubric | null;
}

type Row = { label: string; score: number; hint?: string };

export function AtsSubscoreBars({ deterministic, rubric }: AtsSubscoreBarsProps) {
  const rows: Row[] = [];

  if (deterministic.keywordCoverage) {
    rows.push({
      label: "Keyword coverage",
      score: deterministic.keywordCoverage.score,
      hint: `${deterministic.keywordCoverage.matched.length}/${deterministic.keywordCoverage.matched.length + deterministic.keywordCoverage.missing.length} terms`,
    });
  }
  rows.push({ label: "Sections", score: deterministic.sectionPresence.score });
  rows.push({
    label: "Quantified bullets",
    score: deterministic.bulletQuantification.score,
    hint: `${deterministic.bulletQuantification.quantifiedCount}/${deterministic.bulletQuantification.totalCount}`,
  });
  rows.push({
    label: "Length",
    score: deterministic.lengthBand.score,
    hint: `${deterministic.lengthBand.wordCount} words (${deterministic.lengthBand.band})`,
  });
  rows.push({ label: "Contact", score: deterministic.contactInfo.score });
  rows.push({ label: "Readability", score: deterministic.readability.score });
  rows.push({ label: "Format", score: deterministic.formatSanity.score });

  if (rubric) {
    rows.push({ label: "Relevance", score: rubric.relevance.score, hint: rubric.relevance.notes });
    rows.push({ label: "Impact language", score: rubric.impactLanguage.score, hint: rubric.impactLanguage.notes });
    rows.push({ label: "Tone / seniority", score: rubric.toneSeniority.score, hint: rubric.toneSeniority.notes });
    rows.push({ label: "ATS anti-patterns", score: rubric.atsAntiPatterns.score, hint: rubric.atsAntiPatterns.notes });
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <SubscoreRow key={row.label} row={row} />
      ))}
    </div>
  );
}

function SubscoreRow({ row }: { row: Row }) {
  const color =
    row.score >= 80
      ? "bg-green-500"
      : row.score >= 60
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{row.label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">{row.score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${color}`} style={{ width: `${row.score}%` }} />
      </div>
      {row.hint && <p className="text-[11px] text-muted-foreground">{row.hint}</p>}
    </div>
  );
}
