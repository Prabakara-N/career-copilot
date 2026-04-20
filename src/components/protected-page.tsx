"use client";

import { type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAuth } from "@/lib/use-require-auth";

type Props = {
  children: ReactNode;
  /** Custom skeleton/loader. Defaults to a generic page skeleton. */
  fallback?: ReactNode;
  /** Container className for the default fallback. Override page width here. */
  fallbackMaxWidth?: string;
};

function DefaultPageSkeleton({ maxWidth = "max-w-4xl" }: { maxWidth?: string }) {
  return (
    <main className={`container mx-auto ${maxWidth} px-4 py-8`}>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </main>
  );
}

/**
 * Wrap a page that requires authentication.
 * - Redirects to /login?redirect={current} if not signed in.
 * - Shows a skeleton while auth state is resolving.
 * - Only renders children once user is confirmed signed in.
 *
 * Inside `children` you can call `useAuth()` and assume `user` is non-null.
 */
export function ProtectedPage({ children, fallback, fallbackMaxWidth }: Props) {
  const { user, loading } = useRequireAuth();
  if (loading || !user) {
    return <>{fallback ?? <DefaultPageSkeleton maxWidth={fallbackMaxWidth} />}</>;
  }
  return <>{children}</>;
}
