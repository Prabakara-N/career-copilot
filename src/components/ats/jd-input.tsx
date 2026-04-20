"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JdInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JdInput({ value, onChange }: JdInputProps) {
  const trimmed = value.trim();
  const mode = trimmed.length >= 200 ? "JD-targeted" : "Generic";
  const hint =
    trimmed.length === 0
      ? "No JD pasted — we'll run a generic ATS validation."
      : trimmed.length < 200
        ? `Need at least 200 characters for JD-targeted mode (${trimmed.length}/200).`
        : `${trimmed.length} characters — scoring against this JD.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>2. Paste the job description (optional)</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal">{mode}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="jd-text" className="sr-only">Job description</Label>
        <Textarea
          id="jd-text"
          placeholder="Paste the JD here to score against it. Leave empty for a generic ATS check."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
