import type { CompanyResearch } from "@/lib/schemas/company-research";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OverviewTabProps {
  data: CompanyResearch;
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { overview } = data;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What they do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{overview.whatTheyDo || "No description available."}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">{overview.industry || "Industry unknown"}</Badge>
            <Badge variant="outline">{overview.stage}</Badge>
            {overview.foundedYear && <Badge variant="outline">Founded {overview.foundedYear}</Badge>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {overview.lastFunding ? (
            <p>
              <span className="font-medium">{overview.lastFunding.round}</span>
              {overview.lastFunding.amountUsd != null && (
                <> · {formatUsd(overview.lastFunding.amountUsd)}</>
              )}
              {overview.lastFunding.date && <> · {overview.lastFunding.date}</>}
            </p>
          ) : (
            <p className="text-muted-foreground">No funding details available.</p>
          )}
          {overview.totalRaisedUsd != null && (
            <p className="text-muted-foreground">Total raised: {formatUsd(overview.totalRaisedUsd)}</p>
          )}
        </CardContent>
      </Card>

      {overview.leadership.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leadership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {overview.leadership.map((leader, idx) => (
              <div key={idx}>
                <p className="font-medium">{leader.name}</p>
                <p className="text-xs text-muted-foreground">{leader.role}</p>
                {leader.bio && <p className="mt-1 text-sm">{leader.bio}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {overview.recentNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent news</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {overview.recentNews.map((item, idx) => (
              <div key={idx} className="border-l-2 border-muted pl-3">
                <p className="font-medium">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
                <p className="mt-1">{item.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatUsd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}
