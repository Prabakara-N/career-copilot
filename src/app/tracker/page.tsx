"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { toast } from "sonner";
import { useApplications, deleteApplication, type AppRow } from "@/lib/firebase/use-applications";
import type { ApplicationStatusType } from "@/lib/schemas/application";
import { ProtectedPage } from "@/components/protected-page";
import { TrackerSkeleton } from "@/components/skeletons/tracker-skeleton";
import { useAuth } from "@/components/auth-provider";

const STATUSES: ApplicationStatusType[] = [
  "Evaluated",
  "Applied",
  "Responded",
  "Interview",
  "Offer",
  "Rejected",
  "Discarded",
  "SKIP",
];

function formatDate(ts: AppRow["updatedAt"]): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString();
}

export default function TrackerPage() {
  return (
    <ProtectedPage fallback={<TrackerSkeleton />} fallbackMaxWidth="max-w-6xl">
      <TrackerContent />
    </ProtectedPage>
  );
}

function TrackerContent() {
  const { user } = useAuth();
  const { rows, loading } = useApplications(user?.uid);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusType | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !`${r.company} ${r.role} ${r.notes ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of STATUSES) c[s] = 0;
    rows.forEach((r) => {
      c[r.status] = (c[r.status] ?? 0) + 1;
    });
    return c;
  }, [rows]);

  const handleDelete = async (appId: string) => {
    if (!user) return;
    if (!confirm("Delete this application from your tracker?")) return;
    try {
      await deleteApplication(user.uid, appId);
      toast.success("Removed from tracker");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (!user) return null; // ProtectedPage guarantees this never renders

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every job you've evaluated and saved. Status updates persist across devices.
          </p>
        </div>
        <Link href="/chat">
          <Button variant="outline">Open chat</Button>
        </Link>
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
        >
          All <Badge variant="secondary" className="ml-1.5 font-mono text-[10px]">{counts.all}</Badge>
        </Button>
        {STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            disabled={!counts[s]}
          >
            {s} <Badge variant="secondary" className="ml-1.5 font-mono text-[10px]">{counts[s]}</Badge>
          </Button>
        ))}

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, role, notes…"
          className="ml-auto w-full sm:w-64"
        />
      </div>

      {/* Table */}
      <Card className="mt-6">
        <CardHeader className="border-b">
          <CardTitle className="text-base">{filtered.length} {filtered.length === 1 ? "row" : "rows"}</CardTitle>
          <CardDescription>
            Click a row's report icon to view the full evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {rows.length === 0 ? "No applications yet." : "No rows match your filter."}
              </p>
              {rows.length === 0 && (
                <Link href="/chat">
                  <Button className="mt-4" size="sm">Evaluate your first job</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Company</th>
                    <th className="px-4 py-2 font-medium">Role</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium text-right">Score</th>
                    <th className="px-4 py-2 font-medium">Updated</th>
                    <th className="px-4 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{r.company}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.role}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-right font-mono">{r.score.toFixed(1)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {r.reportId && (
                            <Link href={`/reports/${r.reportId}`}>
                              <Button size="icon" variant="ghost" aria-label="View report" title="View report">
                                <FileText className="size-4" />
                              </Button>
                            </Link>
                          )}
                          {r.jdUrl && (
                            <a href={r.jdUrl} target="_blank" rel="noreferrer">
                              <Button size="icon" variant="ghost" aria-label="Open JD" title="Open JD">
                                <ExternalLink className="size-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete"
                            title="Delete"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
