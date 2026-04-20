"use client";

import type { AtsScore } from "@/lib/schemas/ats-score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AtsScoreHeader } from "./ats-score-header";
import { AtsSubscoreBars } from "./ats-subscore-bars";
import { AtsFindingsList } from "./ats-findings-list";

interface AtsScoreCardProps {
  atsScore: AtsScore;
  tailoredCvFilename?: string;
}

export function AtsScoreCard({ atsScore, tailoredCvFilename }: AtsScoreCardProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">ATS score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AtsScoreHeader
          overallScore={atsScore.overallScore}
          grade={atsScore.grade}
          mode={atsScore.mode}
          modelUsed={atsScore.modelUsed}
        />
        {tailoredCvFilename && (
          <p className="text-xs text-muted-foreground">
            Scored against: <span className="font-mono">{tailoredCvFilename}</span>
          </p>
        )}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sub-scores
          </h4>
          <AtsSubscoreBars deterministic={atsScore.deterministic} rubric={atsScore.rubric} />
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Findings
          </h4>
          <AtsFindingsList findings={atsScore.findings} />
        </div>
      </CardContent>
    </Card>
  );
}
