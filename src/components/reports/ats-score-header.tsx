import type { AtsGrade, AtsMode } from "@/lib/schemas/ats-score";
import { Badge } from "@/components/ui/badge";

const gradeStyle: Record<AtsGrade, string> = {
  A: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100",
  B: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
  C: "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  D: "bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
  F: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100",
};

const modeLabel: Record<AtsMode, string> = {
  "jd-targeted": "JD-targeted",
  generic: "Generic",
};

interface AtsScoreHeaderProps {
  overallScore: number;
  grade: AtsGrade;
  mode: AtsMode;
  modelUsed: string;
}

export function AtsScoreHeader({ overallScore, grade, mode, modelUsed }: AtsScoreHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">ATS score</p>
        <p className="text-4xl font-bold">
          {overallScore}
          <span className="text-xl text-muted-foreground"> / 100</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Scored by {modelUsed}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge className={`${gradeStyle[grade]} text-base px-4 py-1.5`} variant="outline">
          Grade {grade}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {modeLabel[mode]}
        </Badge>
      </div>
    </div>
  );
}
