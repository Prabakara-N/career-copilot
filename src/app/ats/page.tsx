import Link from "next/link";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/protected-page";
import { AtsAnalyzerClient } from "@/components/ats/analyzer-client";

export const metadata = {
  title: "ATS analyzer — Career-Ops",
  description: "Score and fix your resume against any JD or against generic ATS best practices.",
};

export default function AtsPage() {
  return (
    <ProtectedPage>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ATS analyzer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Score your resume against a JD or generic ATS best practices. One-click &ldquo;Fix with AI&rdquo; applies all improvements.
            </p>
          </div>
          <Link href="/ats/history">
            <Button variant="outline" size="sm" className="gap-2">
              <History className="size-4" />
              History
            </Button>
          </Link>
        </div>
        <div className="mt-6">
          <AtsAnalyzerClient />
        </div>
      </main>
    </ProtectedPage>
  );
}
