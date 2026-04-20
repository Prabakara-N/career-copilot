"use client";

import { motion } from "framer-motion";
import { Loader2, Check, AlertCircle, Search, FileSearch, Star, FileText, Save, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PdfActions } from "@/components/pdf/pdf-actions";

const toolMeta: Record<string, { label: string; Icon: typeof Search }> = {
  fetch_jd: { label: "Fetching job description", Icon: FileSearch },
  evaluate_job: { label: "Evaluating job", Icon: Star },
  research_company: { label: "Researching company", Icon: Search },
  tailor_cv: { label: "Tailoring CV", Icon: FileText },
  generate_cover_letter: { label: "Writing cover letter", Icon: Mail },
  save_to_tracker: { label: "Saving to tracker", Icon: Save },
};

type Props = {
  toolName: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function detectPdf(output: unknown): { filename: string; base64: string } | null {
  if (!output || typeof output !== "object") return null;
  const o = output as { ok?: boolean; filename?: string; base64?: string; mimeType?: string };
  if (o.ok && o.filename && o.base64 && o.mimeType === "application/pdf") {
    return { filename: o.filename, base64: o.base64 };
  }
  return null;
}

export function ToolIndicator({ toolName, state, output, errorText }: Props) {
  const meta = toolMeta[toolName] ?? { label: toolName, Icon: Search };
  const Icon = meta.Icon;
  const isRunning = state === "input-streaming" || state === "input-available";
  const isDone = state === "output-available";
  const isError = state === "output-error";
  const pdf = isDone ? detectPdf(output) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "my-2 px-3 py-2 border-dashed bg-muted/30",
          isError && "border-destructive/50 bg-destructive/5",
          isDone && "border-primary/40 bg-primary/5"
        )}
      >
        <div className="flex items-center gap-2">
          <Badge
            variant={isError ? "destructive" : isDone ? "default" : "secondary"}
            className="font-mono text-[10px] gap-1"
          >
            {isRunning ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isDone ? (
              <Check className="size-3" />
            ) : (
              <AlertCircle className="size-3" />
            )}
            tool
          </Badge>
          <Icon className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{meta.label}</span>
          {isRunning && <span className="text-xs text-muted-foreground">working…</span>}
        </div>

        {pdf && (
          <div className="mt-2">
            <PdfActions filename={pdf.filename} base64={pdf.base64} />
          </div>
        )}

        {errorText && <p className="mt-1 text-xs text-destructive">{errorText}</p>}
      </Card>
    </motion.div>
  );
}
