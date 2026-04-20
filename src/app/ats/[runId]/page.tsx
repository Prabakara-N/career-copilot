import { use } from "react";
import { ProtectedPage } from "@/components/protected-page";
import { RunDetail } from "@/components/ats/run-detail";

export const metadata = {
  title: "ATS run — Career-Ops",
};

export default function AtsRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  return (
    <ProtectedPage>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">ATS run</h1>
        <div className="mt-6">
          <RunDetail runId={runId} />
        </div>
      </main>
    </ProtectedPage>
  );
}
