import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TrackerSkeleton() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div className="mt-6 flex flex-wrap gap-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      <Card className="mt-6">
        <CardContent className="space-y-3 p-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
