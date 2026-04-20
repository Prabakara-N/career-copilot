"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { GoogleIcon } from "@/components/ui/google-icon";

function isSafeRedirect(path: string | null): string {
  if (!path) return "/chat";
  // Only allow internal paths starting with / (no protocol-relative or absolute URLs)
  if (!path.startsWith("/") || path.startsWith("//")) return "/chat";
  return path;
}

function LoginInner() {
  const { user, signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = isSafeRedirect(params.get("redirect"));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, redirectTo, router]);

  const handleSignIn = async () => {
    setError(null);
    setBusy(true);
    try {
      await signIn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(
        msg.includes("auth/")
          ? "Sign-in failed. Make sure Firebase Auth is configured and Google sign-in is enabled in your Firebase project."
          : msg
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <CardHeader className="px-0">
          <CardTitle>Sign in to Career-Ops</CardTitle>
          <CardDescription>
            {redirectTo !== "/chat"
              ? `Sign in to continue to ${redirectTo}.`
              : "Use Google to sign in. We never store passwords — Firebase handles auth."}
          </CardDescription>
        </CardHeader>
        <Button
          onClick={handleSignIn}
          disabled={busy}
          variant="outline"
          className="w-full gap-2 bg-white text-slate-900 hover:bg-slate-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <GoogleIcon className="size-4" />
          {busy ? "Signing in…" : "Continue with Google"}
        </Button>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-xs text-muted-foreground">
          Sign-in unlocks persistent tracker, multi-device sync, saved CV history, and chat history.
        </p>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
