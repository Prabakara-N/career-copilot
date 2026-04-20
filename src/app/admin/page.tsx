"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Users, MessageSquare, FileText, Briefcase, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { ProtectedPage } from "@/components/protected-page";

type AdminUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  lastLoginAt: string | null;
  chatCount: number;
  reportCount: number;
  applicationCount: number;
};

type Metrics = {
  totals: { users: number; chats: number; reports: number; applications: number };
  users: AdminUser[];
};

export default function AdminPage() {
  return (
    <ProtectedPage fallback={<AdminSkeleton />} fallbackMaxWidth="max-w-6xl">
      <AdminContent />
    </ProtectedPage>
  );
}

function AdminSkeleton() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
      <Skeleton className="mt-6 h-96 w-full" />
    </main>
  );
}

function AdminContent() {
  const { user, getIdToken } = useAuth();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not signed in");
      const res = await fetch("/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setMetrics(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (user) fetchMetrics();
  }, [user, fetchMetrics]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            System-wide metrics. Restricted to emails in <code className="font-mono text-xs">ADMIN_EMAILS</code>.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading} className="gap-2">
          <RefreshCw className={loading ? "size-3.5 animate-spin" : "size-3.5"} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mt-6 border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldAlert className="mt-0.5 size-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-destructive">{error}</p>
              {error.toLowerCase().includes("forbidden") && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Add your email to the <code className="font-mono">ADMIN_EMAILS</code> environment variable
                  (comma-separated) and restart the dev server.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {metrics && (
        <>
          {/* Totals */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Users} label="Users" value={metrics.totals.users} />
            <StatCard icon={MessageSquare} label="Chats" value={metrics.totals.chats} />
            <StatCard icon={FileText} label="Reports" value={metrics.totals.reports} />
            <StatCard icon={Briefcase} label="Applications" value={metrics.totals.applications} />
          </div>

          {/* Users table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Users</CardTitle>
              <CardDescription>Top 50 by last login.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Email</th>
                      <th className="px-4 py-2 font-medium">Last login</th>
                      <th className="px-4 py-2 font-medium text-right">Chats</th>
                      <th className="px-4 py-2 font-medium text-right">Reports</th>
                      <th className="px-4 py-2 font-medium text-right">Apps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.users.map((u) => (
                      <tr key={u.uid} className="border-b transition-colors hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium">{u.displayName ?? "—"}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{u.email ?? "—"}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-2 text-right font-mono">{u.chatCount}</td>
                        <td className="px-4 py-2 text-right font-mono">{u.reportCount}</td>
                        <td className="px-4 py-2 text-right font-mono">{u.applicationCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-muted/50 p-2">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
