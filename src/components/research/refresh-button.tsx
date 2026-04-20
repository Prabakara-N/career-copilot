"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";

interface RefreshResearchButtonProps {
  slug: string;
  companyName: string;
}

export function RefreshResearchButton({ slug, companyName }: RefreshResearchButtonProps) {
  const { getIdToken } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await getIdToken();
      if (!token) {
        toast.error("Sign in required");
        return;
      }
      const res = await fetch(`/api/research/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "Refresh failed");
        return;
      }
      toast.success("Company data refreshed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
      {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
      {refreshing ? "Refreshing…" : "Refresh"}
    </Button>
  );
}
