import { z } from "zod";
import { AtsMode, AtsScoreSchema } from "./ats-score";

const CvPdfDataSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  location: z.string().optional(),
  summary: z.string(),
  competencies: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      location: z.string().optional(),
      bullets: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
      description: z.string(),
      tech: z.string(),
    })
  ),
  skills: z.array(z.object({ category: z.string(), items: z.string() })),
  certifications: z.array(
    z.object({
      title: z.string(),
      issuer: z.string(),
      year: z.string(),
      url: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      title: z.string(),
      org: z.string(),
      period: z.string(),
      notes: z.string().optional(),
    })
  ),
});

export const AtsRunSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mode: AtsMode,
  input: z.object({
    resumeSource: z.enum(["profile", "upload"]),
    cvData: CvPdfDataSchema,
    jdText: z.string().nullable(),
    jdSnippet: z.string(),
  }),
  initialScore: AtsScoreSchema,
  fix: z
    .object({
      appliedAt: z.string(),
      cvData: CvPdfDataSchema,
      diffSummary: z.array(z.string()),
      score: AtsScoreSchema,
    })
    .nullable(),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
});
export type AtsRun = z.infer<typeof AtsRunSchema>;

export type AtsRunSummary = {
  id: string;
  mode: AtsRun["mode"];
  resumeSource: AtsRun["input"]["resumeSource"];
  jdSnippet: string;
  initialScoreValue: number;
  fixedScoreValue: number | null;
  createdAt: string | null;
};
