import { z } from "zod";

/**
 * Structured fields the AI extracts from an uploaded resume.
 * All fields are optional — AI returns what it can find, blanks for the rest.
 */
export const ResumeParsedSchema = z.object({
  fullName: z.string().describe("The candidate's full name"),
  email: z.string().describe("Email address (or empty if not present)"),
  phone: z.string().describe("Phone number (or empty)"),
  location: z.string().describe("City, Country (or empty)"),
  yearsExperience: z.string().describe("Years of experience as a decimal string, e.g. '2.5' (or empty)"),
  linkedinUrl: z.string().describe("Full LinkedIn URL starting with https:// (or empty)"),
  portfolioUrl: z.string().describe("Personal site / portfolio URL (or empty)"),
  githubUrl: z.string().describe("Full GitHub URL (or empty)"),
  currentRole: z.string().describe("Most recent job title (or empty)"),
  skills: z
    .array(z.string())
    .describe("Top 8 to 20 technical skills extracted from the resume (each a short phrase like 'React', 'TypeScript', 'Firebase Admin')"),
  targetRoles: z
    .array(z.string())
    .describe(
      "3 to 5 likely target role titles inferred from the candidate's most recent role(s) and stack — e.g. ['Frontend Engineer', 'Full Stack Engineer', 'Next.js Developer']"
    ),
  markdown: z.string().describe("The full resume rewritten as clean Markdown — see the system prompt for format"),
});

export type ResumeParsed = z.infer<typeof ResumeParsedSchema>;
