import { describe, expect, it } from "vitest";
import { scoreDeterministic } from "./deterministic";
import type { CvPdfData } from "@/lib/cv/pdf-document";

function makeCv(overrides: Partial<CvPdfData> = {}): CvPdfData {
  return {
    name: "Test",
    email: "t@example.com",
    phone: "+1 555 555",
    linkedinUrl: "https://linkedin.com/in/test",
    portfolioUrl: "https://example.com",
    location: "Remote",
    summary:
      "Frontend engineer with 3 years shipping React and Next.js apps. Delivered 40% faster load times and drove 25k DAU.",
    competencies: ["React", "Next.js", "TypeScript", "Tailwind", "Firebase", "tRPC"],
    experience: [
      {
        company: "Acme",
        role: "Software Engineer",
        period: "2022 – Present",
        bullets: [
          "Built a Next.js 14 dashboard serving 50k monthly users with 99.9% uptime.",
          "Cut LCP by 35% through image pipeline + React Server Component migration.",
          "Mentored 3 junior engineers and led the migration to TypeScript strict mode.",
          "Shipped realtime Firestore sync with optimistic UI across 12 routes.",
        ],
      },
    ],
    projects: [
      { title: "Dashboard", description: "Realtime analytics.", tech: "React, Firestore" },
    ],
    skills: [{ category: "Frontend", items: "React, Next.js, TypeScript, Tailwind" }],
    certifications: [{ title: "AWS CP", issuer: "AWS", year: "2024" }],
    education: [{ title: "BE CS", org: "Test Uni", period: "2018-2022" }],
    ...overrides,
  };
}

describe("scoreDeterministic — strong CV", () => {
  it("scores highly on an ideal JD-targeted CV", () => {
    const cv = makeCv();
    const jd = [
      "We are hiring a senior frontend engineer to help build our React and Next.js platform.",
      "You will ship TypeScript apps and collaborate with design on Tailwind-based component systems.",
      "Responsibilities: own realtime dashboards backed by Firebase, improve performance, mentor juniors.",
      "Required: 3+ years React, Next.js, and TypeScript. Experience with Firestore, tRPC, and Tailwind CSS.",
      "Nice to have: React Server Components, realtime sync, performance tuning, LCP optimization, strict TypeScript.",
      "You will own the frontend architecture, code reviews, and drive migration projects.",
    ].join(" ");
    const { scores, findings } = scoreDeterministic({ cv, jdText: jd, mode: "jd-targeted" });
    expect(scores.subtotal).toBeGreaterThanOrEqual(70);
    expect(scores.keywordCoverage).not.toBeNull();
    const nonKeywordCriticals = findings.filter(
      (f) => f.severity === "critical" && f.category !== "keyword"
    );
    expect(nonKeywordCriticals).toHaveLength(0);
  });
});

describe("scoreDeterministic — weak CV", () => {
  it("flags missing sections and short length", () => {
    const cv = makeCv({
      summary: "",
      experience: [],
      skills: [],
      education: [],
      projects: [],
      competencies: [],
    });
    const { scores, findings } = scoreDeterministic({ cv, mode: "generic" });
    expect(scores.sectionPresence.missing).toContain("experience");
    expect(findings.some((f) => f.severity === "critical")).toBe(true);
    expect(scores.subtotal).toBeLessThan(50);
  });
});

describe("scoreDeterministic — generic mode", () => {
  it("skips keyword coverage when mode is generic", () => {
    const cv = makeCv();
    const result = scoreDeterministic({ cv, mode: "generic" });
    expect(result.scores.keywordCoverage).toBeNull();
  });
});

describe("scoreDeterministic — quantification", () => {
  it("flags low bullet quantification", () => {
    const cv = makeCv({
      experience: [
        {
          company: "Acme",
          role: "SWE",
          period: "2022 – Present",
          bullets: [
            "Worked on the frontend team.",
            "Helped with the migration project.",
            "Did code reviews and supported juniors.",
          ],
        },
      ],
    });
    const { scores, findings } = scoreDeterministic({ cv, mode: "generic" });
    expect(scores.bulletQuantification.quantifiedCount).toBe(0);
    expect(findings.some((f) => f.category === "quantification")).toBe(true);
  });
});

describe("scoreDeterministic — contact", () => {
  it("is critical when email is missing", () => {
    const cv = makeCv({ email: "" });
    const { findings } = scoreDeterministic({ cv, mode: "generic" });
    expect(findings.some((f) => f.category === "contact" && f.severity === "critical")).toBe(true);
  });
});
