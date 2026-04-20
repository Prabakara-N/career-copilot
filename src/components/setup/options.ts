import type { WorkMode, JobType } from "@/lib/firebase/users";

export const WORK_MODE_OPTIONS: ReadonlyArray<{ value: WorkMode; label: string }> = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

export const JOB_TYPE_OPTIONS: ReadonlyArray<{ value: JobType; label: string }> = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];
