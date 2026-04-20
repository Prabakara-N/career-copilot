import { describe, expect, it } from "vitest";
import { computeKeywordCoverage, extractJdKeywords, flattenCvCorpus } from "./keywords";
import type { CvPdfData } from "@/lib/cv/pdf-document";

const cv: CvPdfData = {
  name: "Test User",
  email: "t@example.com",
  summary: "Frontend engineer with React and Next.js experience building SaaS dashboards.",
  competencies: ["React", "Next.js", "TypeScript"],
  experience: [
    {
      company: "Acme",
      role: "Software Engineer",
      period: "2023 – Present",
      bullets: [
        "Shipped a Next.js 14 app with Firebase backend.",
        "Built reusable React components in TypeScript.",
      ],
    },
  ],
  projects: [
    { title: "Dashboard", description: "Realtime analytics with Firestore.", tech: "React, Firestore" },
  ],
  skills: [{ category: "Frontend", items: "React, Next.js, TypeScript, Tailwind" }],
  certifications: [],
  education: [],
};

describe("flattenCvCorpus", () => {
  it("includes summary, competencies, bullets, projects, skills", () => {
    const corpus = flattenCvCorpus(cv);
    expect(corpus.some((s) => s.toLowerCase().includes("react"))).toBe(true);
    expect(corpus.some((s) => s.toLowerCase().includes("firestore"))).toBe(true);
    expect(corpus.some((s) => s.toLowerCase().includes("tailwind"))).toBe(true);
  });
});

describe("extractJdKeywords", () => {
  it("merges seeds first, then extracted phrases, dedupes", () => {
    const out = extractJdKeywords("React and Next.js developer wanted", { seedKeywords: ["React"] });
    expect(out[0]).toBe("react");
    expect(new Set(out).size).toBe(out.length);
  });
});

describe("computeKeywordCoverage", () => {
  it("returns high score when CV covers JD terms", () => {
    const jd = "Hiring a React engineer with Next.js and TypeScript experience.";
    const result = computeKeywordCoverage(jd, cv);
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.matched).toContain("react");
  });

  it("returns low score when CV misses JD terms", () => {
    const jd = "Senior Rust engineer with Kubernetes and gRPC experience.";
    const result = computeKeywordCoverage(jd, cv);
    expect(result.score).toBeLessThan(50);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it("handles empty JD gracefully", () => {
    const result = computeKeywordCoverage("", cv);
    expect(result.score).toBe(0);
    expect(result.matched).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});
