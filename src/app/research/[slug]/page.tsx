import { notFound } from "next/navigation";
import { researchCompanyStructured } from "@/lib/ai/research/orchestrator";
import { getCachedResearch } from "@/lib/firebase/company-research";
import type { CompanyResearch } from "@/lib/schemas/company-research";
import { CompanyHeader } from "@/components/research/company-header";
import { ResearchTabs } from "@/components/research/research-tabs";
import { CitationsFooter } from "@/components/research/citations-footer";

export const metadata = {
  title: "Company research — Career-Ops",
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string }>;
};

export default async function CompanyResearchPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { name } = await searchParams;
  const companyName = name ?? prettyNameFromSlug(slug);

  let data: CompanyResearch;
  let source: "cache" | "fresh";

  try {
    const cached = await getCachedResearch(slug);
    if (cached) {
      const { _cachedAt: _discard, ...rest } = cached;
      void _discard;
      data = rest;
      source = "cache";
    } else {
      const fresh = await researchCompanyStructured({ companyName });
      data = fresh.data;
      source = fresh.source;
    }
  } catch {
    notFound();
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <CompanyHeader data={data} source={source} />
      <ResearchTabs data={data} />
      <CitationsFooter citations={data.citations} />
    </main>
  );
}

function prettyNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
