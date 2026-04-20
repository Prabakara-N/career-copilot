import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
    message: "Must start with http:// or https://",
  });

const optionalDecimal = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+(\.\d+)?$/.test(v), {
    message: "Must be a number",
  })
  .refine((v) => v === "" || parseFloat(v) <= 60, {
    message: "Must be 60 or less",
  });

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\+?[\d\s\-()]{7,20}$/.test(v), {
    message: "Invalid phone number",
  });

export const WorkModeEnum = z.enum(["remote", "hybrid", "onsite"]);
export const JobTypeEnum = z.enum(["full-time", "part-time", "contract", "internship"]);

export const ProfileFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120, "Too long"),
  phone: optionalPhone,
  location: z.string().trim().max(120, "Too long"),
  yearsExperience: optionalDecimal,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  githubUrl: optionalUrl,
  targetRoles: z.array(z.string().trim().min(1)).max(15, "Max 15 target roles"),
  skills: z.array(z.string().trim().min(1)).max(40, "Max 40 skills"),
  targetSalary: z.string().trim().max(60, "Too long"),
  workModes: z.array(WorkModeEnum).max(3),
  jobTypes: z.array(JobTypeEnum).max(4),
  openToRelocation: z.boolean(),
  noticePeriod: z.string().trim().max(40, "Too long"),
  cvMarkdown: z.string().max(50_000, "CV is too long (max 50k chars)"),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

export function emptyProfileForm(): ProfileFormValues {
  return {
    fullName: "",
    phone: "",
    location: "",
    yearsExperience: "",
    linkedinUrl: "",
    portfolioUrl: "",
    githubUrl: "",
    targetRoles: [],
    skills: [],
    targetSalary: "",
    workModes: [],
    jobTypes: [],
    openToRelocation: false,
    noticePeriod: "",
    cvMarkdown: "",
  };
}
