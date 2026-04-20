import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/protected-page";
import { AtsHistoryList } from "@/components/ats/history-list";

export const metadata = {
  title: "ATS history — Career-Ops",
};

export default function AtsHistoryPage() {
  return (
    <ProtectedPage>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Link href="/ats">
          <Button variant="ghost" size="sm" className="mb-2 gap-1.5">
            <ArrowLeft className="size-3.5" />
            Back to analyzer
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">ATS analyzer history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every run you&rsquo;ve scored. Click to view details and fixes.
        </p>
        <div className="mt-6">
          <AtsHistoryList />
        </div>
      </main>
    </ProtectedPage>
  );
}
