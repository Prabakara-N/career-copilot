import { z } from "zod";

export const ProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  targetRoles: z.array(z.string()).default([]),
  yearsExperience: z.number().min(0).optional(),
  cvMarkdown: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Profile = z.infer<typeof ProfileSchema>;
