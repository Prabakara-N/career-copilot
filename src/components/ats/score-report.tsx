"use client";

import type { AtsScore } from "@/lib/schemas/ats-score";
import { AtsScoreCard } from "@/components/reports/ats-score-card";

interface ScoreReportProps {
  atsScore: AtsScore;
  title?: string;
}

export function ScoreReport({ atsScore, title }: ScoreReportProps) {
  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>}
      <AtsScoreCard atsScore={atsScore} />
    </div>
  );
}
