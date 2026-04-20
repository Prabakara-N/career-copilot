import { describe, expect, it, vi } from "vitest";
import type { CvPdfData } from "@/lib/cv/pdf-document";

vi.mock("./rubric", () => ({
  scoreRubric: vi.fn(async () => ({
    rubric: {
      relevance: { score: 80, notes: "ok" },
      impactLanguage: { score: 75, notes: "ok" },
      toneSeniority: { score: 80, notes: "ok" },
      atsAntiPatterns: { score: 85, notes: "ok" },
      subtotal: 80,
    },
    findings: [],
    modelUsed: "claude-haiku-4-5",
  })),
}));

// Import after mock is registered.
const { computeAtsScore } = await import("./index");

const cv: CvPdfData = {
  name: "Test",
  email: "t@example.com",
  phone: "+1",
  summary:
    "Frontend engineer with 3 years shipping React and Next.js apps. Improved LCP by 35% and drove 25k DAU.",
  competencies: ["React", "Next.js", "TypeScript"],
  experience: [
    {
      company: "Acme",
      role: "SWE",
      period: "2022 – Present",
      bullets: [
        "Shipped Next.js 14 dashboard with 99.9% uptime serving 50k users.",
        "Cut LCP by 35% via image pipeline and RSC migration.",
        "Mentored 3 juniors and led strict-mode TypeScript migration.",
      ],
    },
  ],
  projects: [{ title: "App", description: "Realtime.", tech: "React" }],
  skills: [{ category: "Frontend", items: "React, Next.js, TypeScript" }],
  certifications: [],
  education: [{ title: "BE", org: "X", period: "2018-2022" }],
};

describe("computeAtsScore", () => {
  it("produces a merged 0-100 score with a grade", async () => {
    const score = await computeAtsScore({ cv, mode: "generic" });
    expect(score.overallScore).toBeGreaterThanOrEqual(0);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(["A", "B", "C", "D", "F"]).toContain(score.grade);
    expect(score.rubric).not.toBeNull();
  });

  it("infers mode from jdText length", async () => {
    const longJd = "React developer with Next.js and TypeScript. ".repeat(20);
    const score = await computeAtsScore({ cv, jdText: longJd });
    expect(score.mode).toBe("jd-targeted");
  });

  it("falls back when rubric throws", async () => {
    const rubricMod = await import("./rubric");
    const spy = vi.spyOn(rubricMod, "scoreRubric").mockRejectedValueOnce(new Error("boom"));
    const score = await computeAtsScore({ cv, mode: "generic" });
    expect(score.rubric).toBeNull();
    expect(score.overallScore).toBe(score.deterministic.subtotal);
    expect(score.findings.some((f) => f.message.includes("Rubric scorer unavailable"))).toBe(true);
    spy.mockRestore();
  });

  it("dedupes identical findings", async () => {
    const score = await computeAtsScore({ cv, mode: "generic" });
    const msgs = score.findings.map((f) => `${f.category}|${f.message.toLowerCase()}`);
    expect(new Set(msgs).size).toBe(msgs.length);
  });
});
