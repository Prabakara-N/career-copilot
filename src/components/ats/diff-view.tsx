"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface DiffViewProps {
  diffSummary: string[];
}

export function DiffView({ diffSummary }: DiffViewProps) {
  if (diffSummary.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Changes the AI made</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {diffSummary.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-green-600 dark:text-green-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
