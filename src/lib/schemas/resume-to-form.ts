import type { ProfileFormValues } from "./profile-form";
import type { ResumeParsed } from "./resume-parsed";

/**
 * Map AI-parsed resume fields into partial form values.
 * Empty strings/arrays from the AI are passed through — the caller decides whether
 * to overwrite existing form values or merge.
 */
export function resumeParsedToFormValues(parsed: ResumeParsed): Partial<ProfileFormValues> {
  return {
    fullName: parsed.fullName,
    phone: parsed.phone,
    location: parsed.location,
    yearsExperience: parsed.yearsExperience,
    linkedinUrl: parsed.linkedinUrl,
    portfolioUrl: parsed.portfolioUrl,
    githubUrl: parsed.githubUrl,
    targetRoles: parsed.targetRoles,
    skills: parsed.skills,
    cvMarkdown: parsed.markdown,
  };
}
