import type { CompanyResearch } from "@/lib/schemas/company-research";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";

interface ReviewsTabProps {
  data: CompanyResearch;
}

type Platform = {
  label: string;
  rating: number | null;
  pros: string[];
  cons: string[];
  url: string | null;
};

export function ReviewsTab({ data }: ReviewsTabProps) {
  const platforms: Platform[] = [];
  if (data.reviews.glassdoor) {
    platforms.push({ label: "Glassdoor", ...data.reviews.glassdoor });
  }
  if (data.reviews.ambitionBox) {
    platforms.push({ label: "AmbitionBox", ...data.reviews.ambitionBox });
  }

  return (
    <div className="space-y-4">
      {data.reviews.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{data.reviews.summary}</p>
          </CardContent>
        </Card>
      )}

      {platforms.map((p) => (
        <PlatformCard key={p.label} platform={p} />
      ))}

      {data.reviews.blind && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Blind</span>
              <Badge variant="outline">{data.reviews.blind.sentiment}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.reviews.blind.topThreads.length > 0 && (
              <ul className="space-y-1">
                {data.reviews.blind.topThreads.map((thread, idx) => (
                  <li key={idx} className="text-muted-foreground">— {thread}</li>
                ))}
              </ul>
            )}
            {data.reviews.blind.url && (
              <a href={data.reviews.blind.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline">
                Open on Blind <ExternalLink className="size-3" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {data.reviews.comparably && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparably</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.reviews.comparably.cultureScore != null && (
              <p>Culture score: <span className="font-mono">{data.reviews.comparably.cultureScore}</span></p>
            )}
            {data.reviews.comparably.url && (
              <a href={data.reviews.comparably.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline">
                Open on Comparably <ExternalLink className="size-3" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {platforms.length === 0 && !data.reviews.blind && !data.reviews.comparably && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No public review data found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{platform.label}</span>
          {platform.rating != null && (
            <Badge variant="outline" className="font-mono">{platform.rating.toFixed(1)} / 5</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {platform.pros.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
              <ThumbsUp className="size-3" />
              Pros
            </div>
            <ul className="space-y-1 text-muted-foreground">
              {platform.pros.map((pro, idx) => <li key={idx}>— {pro}</li>)}
            </ul>
          </div>
        )}
        {platform.cons.length > 0 && (
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
              <ThumbsDown className="size-3" />
              Cons
            </div>
            <ul className="space-y-1 text-muted-foreground">
              {platform.cons.map((con, idx) => <li key={idx}>— {con}</li>)}
            </ul>
          </div>
        )}
        {platform.url && (
          <a href={platform.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline">
            Open on {platform.label} <ExternalLink className="size-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
