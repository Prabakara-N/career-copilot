import { z } from "zod";

export const ApplicationStatus = z.enum([
  "Evaluated",
  "Applied",
  "Responded",
  "Interview",
  "Offer",
  "Rejected",
  "Discarded",
  "SKIP",
]);

export type ApplicationStatusType = z.infer<typeof ApplicationStatus>;

export const ApplicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  evaluationId: z.string().optional(),
  company: z.string(),
  role: z.string(),
  jdUrl: z.string().url().optional(),
  status: ApplicationStatus,
  score: z.number().min(0).max(5),
  pdfStorageRef: z.string().optional(),
  notes: z.string().optional(),
  appliedAt: z.date().optional(),
  lastContactAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Application = z.infer<typeof ApplicationSchema>;
