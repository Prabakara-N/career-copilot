import type { CompanyResearch } from "@/lib/schemas/company-research";
import { Badge } from "@/components/ui/badge";
import { RefreshResearchButton } from "./refresh-button";

interface CompanyHeaderProps {
  data: CompanyResearch;
  source: "cache" | "fresh";
}

export function CompanyHeader({ data, source }: CompanyHeaderProps) {
  const fetchedDate = new Date(data.fetchedAt);
  const fetchedLabel = Number.isFinite(fetchedDate.getTime())
    ? fetchedDate.toLocaleString()
    : data.fetchedAt;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{data.companyName}</h1>
        {data.overview.oneLiner && (
          <p className="mt-1 text-sm text-muted-foreground">{data.overview.oneLiner}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-[10px]">{data.overview.industry || "industry unknown"}</Badge>
          <Badge variant="outline" className="text-[10px]">{data.overview.stage}</Badge>
          {data.locations.hq && (
            <span>HQ · {data.locations.hq.city}, {data.locations.hq.country}</span>
          )}
          <span>·</span>
          <span>{source === "cache" ? "Cached" : "Fresh"} · {fetchedLabel}</span>
          <span>·</span>
          <span>{data.citations.length} citation{data.citations.length === 1 ? "" : "s"}</span>
        </div>
      </div>
      <RefreshResearchButton slug={data.companySlug} companyName={data.companyName} />
    </div>
  );
}
