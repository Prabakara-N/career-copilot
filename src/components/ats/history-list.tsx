"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useAtsRuns } from "@/lib/firebase/use-ats-runs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export function AtsHistoryList() {
  const { user } = useAuth();
  const { rows, loading } = useAtsRuns(user?.uid);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No analyzer runs yet. Head back and score a resume.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <Link key={row.id} href={`/ats/${row.id}`}>
          <Card className="transition-colors hover:bg-muted/40">
            <CardContent className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {row.mode === "jd-targeted" ? "JD-targeted" : "Generic"}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {row.resumeSource === "profile" ? "Profile" : "Upload"}
                  </Badge>
                  {row.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
                {row.jdSnippet && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{row.jdSnippet}</p>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="text-right">
                  <p className="font-mono font-bold">{row.initialScoreValue}</p>
                  {row.fixedScoreValue !== null && (
                    <p className="font-mono text-xs text-green-600 dark:text-green-400">
                      → {row.fixedScoreValue}
                    </p>
                  )}
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
