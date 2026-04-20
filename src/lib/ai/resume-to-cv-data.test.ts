import { describe, expect, it } from "vitest";
import { resumeParsedToCvData } from "./resume-to-cv-data";
import type { ResumeParsed } from "@/lib/schemas/resume-parsed";

const sample: ResumeParsed = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 555",
  location: "Remote",
  yearsExperience: "3",
  linkedinUrl: "https://linkedin.com/in/jane",
  portfolioUrl: "",
  githubUrl: "",
  currentRole: "Frontend Engineer",
  skills: ["React", "TypeScript", "Next.js", "Tailwind"],
  targetRoles: ["Frontend Engineer"],
  markdown: `# Jane Doe

## Summary
Frontend engineer with 3 years of React experience.

## Experience
### Frontend Engineer at Acme | 2022 – Present
- Built Next.js dashboard for 10k users.
- Improved LCP by 30%.

### Intern at Beta | 2021 – 2022
- Fixed bugs in legacy jQuery app.

## Projects
### Portfolio Site
My personal portfolio built with Next.js.
**Tech:** Next.js, Tailwind

## Certifications
- Advanced React — Frontend Masters (2024)

## Education
### BS Computer Science | 2018 – 2022
Test University
`,
};

describe("resumeParsedToCvData", () => {
  it("maps contact fields", () => {
    const cv = resumeParsedToCvData(sample);
    expect(cv.name).toBe("Jane Doe");
    expect(cv.email).toBe("jane@example.com");
    expect(cv.linkedinUrl).toBe("https://linkedin.com/in/jane");
  });

  it("extracts summary from markdown", () => {
    const cv = resumeParsedToCvData(sample);
    expect(cv.summary).toMatch(/Frontend engineer with 3 years/);
  });

  it("parses experience entries with bullets", () => {
    const cv = resumeParsedToCvData(sample);
    expect(cv.experience).toHaveLength(2);
    expect(cv.experience[0].role).toBe("Frontend Engineer");
    expect(cv.experience[0].company).toBe("Acme");
    expect(cv.experience[0].bullets.length).toBeGreaterThan(0);
  });

  it("parses projects with tech line", () => {
    const cv = resumeParsedToCvData(sample);
    expect(cv.projects).toHaveLength(1);
    expect(cv.projects[0].title).toBe("Portfolio Site");
    expect(cv.projects[0].tech).toMatch(/Next\.js/);
  });

  it("parses certifications with year", () => {
    const cv = resumeParsedToCvData(sample);
    expect(cv.certifications[0].year).toBe("2024");
    expect(cv.certifications[0].title).toMatch(/Advanced React/);
  });

  it("falls back gracefully when markdown is empty", () => {
    const cv = resumeParsedToCvData({ ...sample, markdown: "" });
    expect(cv.experience).toEqual([]);
    expect(cv.projects).toEqual([]);
  });
});
