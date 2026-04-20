"use client";

import { Badge } from "@/components/ui/badge";
import type { ApplicationStatusType } from "@/lib/schemas/application";
import { cn } from "@/lib/utils";

const styles: Record<ApplicationStatusType, string> = {
  Evaluated: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Applied: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Responded: "bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  Interview: "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Offer: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  Rejected: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200",
  Discarded: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  SKIP: "bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export function StatusBadge({ status }: { status: ApplicationStatusType }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {status}
    </Badge>
  );
}
