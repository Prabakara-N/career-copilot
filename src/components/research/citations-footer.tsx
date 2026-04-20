import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface CitationsFooterProps {
  citations: string[];
}

export function CitationsFooter({ citations }: CitationsFooterProps) {
  if (citations.length === 0) return null;
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-base">Citations ({citations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-1 text-xs text-muted-foreground">
          {citations.map((url, idx) => (
            <li key={url} className="flex gap-2">
              <span className="font-mono">[{idx + 1}]</span>
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 truncate hover:underline">
                {url}
                <ExternalLink className="size-3 flex-shrink-0" />
              </a>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
