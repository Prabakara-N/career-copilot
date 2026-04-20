"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { useReport, deleteReport, type ReportRow } from "@/lib/firebase/use-reports";
import { ProtectedPage } from "@/components/protected-page";
import { AtsScoreCard } from "@/components/reports/ats-score-card";

const verdictStyle: Record<ReportRow["verdict"], string> = {
  Apply: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  Maybe: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Skip: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const blockLabels: Record<string, string> = {
  a_role_fit: "A — Role / Stack Fit",
  b_compensation: "B — Compensation",
  c_growth: "C — Growth",
  d_risk: "D — Risk",
  e_culture: "E — Culture",
  f_logistics: "F — Logistics",
};

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedPage>
      <ReportContent id={id} />
    </ProtectedPage>
  );
}

function ReportContent({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: report, loading, error } = useReport(user?.uid, id);

  const handleDelete = async () => {
    if (!user || !report) return;
    if (!confirm("Delete this evaluation report? This cannot be undone.")) return;
    try {
      await deleteReport(user.uid, report.id);
      toast.success("Report deleted");
      router.push("/tracker");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <p className="text-destructive">{error ?? "Report not found"}</p>
        <Link href="/tracker">
          <Button variant="outline" className="mt-4">Back to tracker</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/tracker">
            <Button variant="ghost" size="sm" className="mb-2 gap-1.5">
              <ArrowLeft className="size-3.5" />
              Back to tracker
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{report.company}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{report.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{report.archetype}</span>
            {report.jdUrl && (
              <>
                <span>·</span>
                <a
                  href={report.jdUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Original posting <ExternalLink className="size-3" />
                </a>
              </>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete report">
          <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>

      {/* Verdict + score */}
      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Overall</p>
            <p className="text-4xl font-bold">{report.overallScore.toFixed(1)} <span className="text-xl text-muted-foreground">/ 5</span></p>
          </div>
          <Badge className={`${verdictStyle[report.verdict]} text-base px-4 py-1.5`} variant="outline">
            {report.verdict}
          </Badge>
        </CardContent>
        <CardContent className="border-t p-6">
          <p className="text-sm leading-relaxed">{report.reasoning}</p>
        </CardContent>
      </Card>

      {/* ATS score (if present) */}
      {report.atsScore && (
        <AtsScoreCard atsScore={report.atsScore} tailoredCvFilename={report.tailoredCvFilename} />
      )}

      {/* Blocks A-F */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Scoring breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(report.blocks).map(([key, b]) => (
                <tr key={key} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium align-top w-1/3">{blockLabels[key] ?? key}</td>
                  <td className="px-4 py-3 font-mono text-right align-top w-20">{b.score.toFixed(1)}</td>
                  <td className="px-4 py-3 text-muted-foreground align-top">{b.notes}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 font-medium align-top">G — Legitimacy</td>
                <td className="px-4 py-3 text-right align-top text-xs">
                  <Badge variant="outline">{report.legitimacy}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground align-top">{report.legitimacyNotes}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Top gaps */}
      {report.topGaps && report.topGaps.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Gaps to address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.topGaps.map((g, i) => (
              <div key={i} className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm font-medium">{g.gap}</p>
                <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Mitigation:</span> {g.mitigation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* STAR stories */}
      {report.starStories && report.starStories.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">STAR+R stories for interviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.starStories.map((s, i) => (
              <div key={i} className="rounded-md border p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">JD requirement</div>
                <div className="font-medium">{s.requirement}</div>
                <div className="mt-2 text-xs text-muted-foreground">Story from <span className="font-medium text-foreground">{s.project}</span></div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="sm:grid sm:grid-cols-[80px_1fr] sm:gap-2"><dt className="font-medium">Situation</dt><dd className="text-muted-foreground sm:text-foreground">{s.situation}</dd></div>
                  <div className="sm:grid sm:grid-cols-[80px_1fr] sm:gap-2"><dt className="font-medium">Task</dt><dd className="text-muted-foreground sm:text-foreground">{s.task}</dd></div>
                  <div className="sm:grid sm:grid-cols-[80px_1fr] sm:gap-2"><dt className="font-medium">Action</dt><dd className="text-muted-foreground sm:text-foreground">{s.action}</dd></div>
                  <div className="sm:grid sm:grid-cols-[80px_1fr] sm:gap-2"><dt className="font-medium">Result</dt><dd className="text-muted-foreground sm:text-foreground">{s.result}</dd></div>
                  <div className="sm:grid sm:grid-cols-[80px_1fr] sm:gap-2"><dt className="font-medium">Reflection</dt><dd className="text-muted-foreground">{s.reflection}</dd></div>
                </dl>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Keywords */}
      {report.keywords && report.keywords.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">ATS keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {report.keywords.map((k) => (
                <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link href="/chat">
          <Button className="gap-2">
            <Sparkles className="size-4" />
            Continue in chat
          </Button>
        </Link>
        <Link href="/tracker">
          <Button variant="outline">Back to tracker</Button>
        </Link>
      </div>

      {/* Original JD */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Original job description</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap break-words text-xs text-muted-foreground scrollbar-hide">{report.jdText}</pre>
        </CardContent>
      </Card>
    </main>
  );
}
