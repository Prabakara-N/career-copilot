import { researchCompanyStructured } from "./research/orchestrator";
import type { CompanyResearch } from "@/lib/schemas/company-research";

/**
 * @deprecated Use researchCompanyStructured() directly for the full structured shape.
 * This wrapper exists for one release cycle to keep the old call sites in tools.ts working.
 */
export type CompanyResearchLegacy = {
  company: string;
  summary: string;
  citations: string[];
  structured: CompanyResearch;
  source: "cache" | "fresh";
  pageUrl: string;
};

export async function researchCompany(company: string): Promise<CompanyResearchLegacy> {
  const result = await researchCompanyStructured({ companyName: company });
  return {
    company: result.data.companyName,
    summary: result.data.reviews.summary || result.data.overview.whatTheyDo || result.data.overview.oneLiner,
    citations: result.data.citations,
    structured: result.data,
    source: result.source,
    pageUrl: `/research/${result.data.companySlug}`,
  };
}
