"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { AtsScore } from "@/lib/schemas/ats-score";
import type { CvPdfData } from "@/lib/cv/pdf-document";
import { ScoreReport } from "./score-report";
import { DiffView } from "./diff-view";

type FixResult = {
  cvData: CvPdfData;
  diffSummary: string[];
  atsScore: AtsScore;
};

interface FixWithAiPanelProps {
  runId: string;
  initialScore: AtsScore;
  getIdToken: () => Promise<string | null>;
}

export function FixWithAiPanel({ runId, initialScore, getIdToken }: FixWithAiPanelProps) {
  const [fixing, setFixing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);

  const actionable = initialScore.findings.filter((f) => f.severity !== "suggestion").length;

  const handleFix = async () => {
    setFixing(true);
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error("Sign in required");
        return;
      }
      const res = await fetch("/api/ats/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ runId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "Fix failed");
        return;
      }
      setResult({ cvData: json.cvData, diffSummary: json.diffSummary, atsScore: json.atsScore });
      toast.success(`New score: ${json.atsScore.overallScore}/100 (grade ${json.atsScore.grade})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fix failed");
    } finally {
      setFixing(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error("Sign in required");
        return;
      }
      const res = await fetch("/api/ats/render-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cvData: result.cvData, company: "ats-fixed" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "PDF render failed");
        return;
      }
      triggerDownload(json.filename, json.base64);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">4. Fix with AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {actionable > 0
            ? `${actionable} actionable issue${actionable === 1 ? "" : "s"} identified. Click below to apply fixes and rescore.`
            : "No critical issues — you can still run the fixer to polish the resume."}
        </p>
        <Button onClick={handleFix} disabled={fixing} className="gap-2">
          {fixing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {fixing ? "Rewriting…" : "Fix all issues with AI"}
        </Button>

        {result && (
          <div className="space-y-4 border-t pt-4">
            <ScoreReport atsScore={result.atsScore} title="Rescored after fix" />
            <DiffView diffSummary={result.diffSummary} />
            <Button variant="outline" onClick={handleDownload} disabled={downloading} className="gap-2">
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {downloading ? "Rendering…" : "Download fixed CV (PDF)"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function triggerDownload(filename: string, base64: string): void {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
