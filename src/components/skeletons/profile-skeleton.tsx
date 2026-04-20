import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-4 w-96" />

      <Card className="mt-6">
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </main>
  );
}
