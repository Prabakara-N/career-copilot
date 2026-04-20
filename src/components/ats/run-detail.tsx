"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { ScoreReport } from "./score-report";
import { DiffView } from "./diff-view";
import type { AtsRun } from "@/lib/schemas/ats-run";

interface RunDetailProps {
  runId: string;
}

export function RunDetail({ runId }: RunDetailProps) {
  const { getIdToken } = useAuth();
  const [run, setRun] = useState<AtsRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) {
          setError("Sign in required");
          return;
        }
        const res = await fetch(`/api/ats/runs/${runId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error ?? "Failed to load run");
          return;
        }
        if (!cancelled) setRun(json.run as AtsRun);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [runId, getIdToken]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading…
      </div>
    );
  }
  if (error || !run) {
    return <p className="text-sm text-destructive">{error ?? "Run not found"}</p>;
  }

  return (
    <div className="space-y-4">
      <Link href="/ats/history">
        <Button variant="ghost" size="sm" className="mb-2 gap-1.5">
          <ArrowLeft className="size-3.5" />
          Back to history
        </Button>
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{run.mode === "jd-targeted" ? "JD-targeted" : "Generic"}</Badge>
        <Badge variant="secondary">{run.input.resumeSource === "profile" ? "Profile resume" : "Uploaded resume"}</Badge>
      </div>

      {run.input.jdText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job description</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-xs text-muted-foreground scrollbar-hide">
              {run.input.jdText}
            </pre>
          </CardContent>
        </Card>
      )}

      <ScoreReport atsScore={run.initialScore} title="Initial score" />
      {run.fix && (
        <>
          <ScoreReport atsScore={run.fix.score} title="Score after fix" />
          <DiffView diffSummary={run.fix.diffSummary} />
        </>
      )}
    </div>
  );
}
