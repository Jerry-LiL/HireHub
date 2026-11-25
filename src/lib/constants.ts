export const PAGE_SIZE = 5;

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const JOB_STATUSES = ["DRAFT", "OPEN", "CLOSED"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
};

export const APPLICATION_STATUSES = [
  "SUBMITTED",
  "REVIEWING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const EMPLOYER_APPLICATION_STATUSES = [
  "SUBMITTED",
  "REVIEWING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  REVIEWING: "Reviewing",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export function isEmploymentType(value: string): value is EmploymentType {
  return (EMPLOYMENT_TYPES as readonly string[]).includes(value);
}
