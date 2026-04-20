import type { AtsFinding } from "@/lib/schemas/ats-score";
import { Badge } from "@/components/ui/badge";

interface AtsFindingsListProps {
  findings: AtsFinding[];
}

const severityStyle: Record<AtsFinding["severity"], string> = {
  critical: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100",
  warning: "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  suggestion: "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100",
};

export function AtsFindingsList({ findings }: AtsFindingsListProps) {
  if (findings.length === 0) {
    return <p className="text-sm text-muted-foreground">No issues detected. Nice work.</p>;
  }
  return (
    <ul className="space-y-3">
      {findings.map((f, idx) => (
        <li key={idx} className="rounded-md border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${severityStyle[f.severity]} text-[10px] uppercase`}>
              {f.severity}
            </Badge>
            <span className="text-xs text-muted-foreground">{f.category}</span>
          </div>
          <p className="mt-2 text-sm">{f.message}</p>
          {f.evidence && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Evidence:</span> {f.evidence}
            </p>
          )}
          {f.fixHint && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Fix:</span> {f.fixHint}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
