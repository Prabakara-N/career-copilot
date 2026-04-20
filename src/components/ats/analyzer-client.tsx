"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import type { AtsScore } from "@/lib/schemas/ats-score";
import type { CvPdfData } from "@/lib/cv/pdf-document";
import { useAuth } from "@/components/auth-provider";
import { ResumeSourcePicker } from "./resume-source-picker";
import { JdInput } from "./jd-input";
import { ScoreReport } from "./score-report";
import { FixWithAiPanel } from "./fix-with-ai-panel";

type Source = "profile" | "upload";

type ScoreState =
  | { status: "idle" }
  | { status: "scoring" }
  | { status: "scored"; runId: string; atsScore: AtsScore };

export function AtsAnalyzerClient() {
  const { getIdToken } = useAuth();
  const [source, setSource] = useState<Source | null>(null);
  const [cvData, setCvData] = useState<CvPdfData | null>(null);
  const [jdText, setJdText] = useState("");
  const [state, setState] = useState<ScoreState>({ status: "idle" });

  const onResumeReady = (args: { source: Source; cvData: CvPdfData }) => {
    setSource(args.source);
    setCvData(args.cvData);
    setState({ status: "idle" });
  };

  const onJdChange = (value: string) => {
    setJdText(value);
    setState({ status: "idle" });
  };

  const handleScore = async () => {
    if (!cvData || !source) {
      toast.error("Pick a resume first");
      return;
    }
    setState({ status: "scoring" });
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error("Sign in required");
        setState({ status: "idle" });
        return;
      }
      const res = await fetch("/api/ats/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cvData, jdText: jdText.trim() || undefined, resumeSource: source }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "Scoring failed");
        setState({ status: "idle" });
        return;
      }
      setState({ status: "scored", runId: json.runId, atsScore: json.atsScore });
      toast.success(`Score: ${json.atsScore.overallScore}/100 (grade ${json.atsScore.grade})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scoring failed");
      setState({ status: "idle" });
    }
  };

  return (
    <div className="space-y-4">
      <ResumeSourcePicker getIdToken={getIdToken} onReady={onResumeReady} />
      <JdInput value={jdText} onChange={onJdChange} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Analyze</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleScore}
            disabled={!cvData || state.status === "scoring"}
            className="gap-2"
          >
            {state.status === "scoring" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {state.status === "scoring" ? "Scoring…" : "Run ATS analysis"}
          </Button>
        </CardContent>
      </Card>

      {state.status === "scored" && (
        <>
          <ScoreReport atsScore={state.atsScore} title="Initial ATS score" />
          <FixWithAiPanel
            runId={state.runId}
            initialScore={state.atsScore}
            getIdToken={getIdToken}
          />
        </>
      )}
    </div>
  );
}
