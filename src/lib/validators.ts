import { z } from "zod";
import {
  EMPLOYER_APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  isEmploymentType,
} from "@/lib/constants";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function fromZodError(error: z.ZodError): ActionState {
  return { fieldErrors: error.flatten().fieldErrors };
}

export function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const employmentTypeSchema = z.enum(EMPLOYMENT_TYPES);
const jobStatusSchema = z.enum(JOB_STATUSES);

const salaryField = z.union([z.string(), z.number(), z.undefined(), z.null()]).transform((value, ctx) => {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  if (!/^\d+$/.test(text)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a whole number of dollars.",
    });
    return z.NEVER;
  }
  const amount = Number(text);
  if (amount < 1 || amount > 10_000_000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Salary must be between 1 and 10,000,000.",
    });
    return z.NEVER;
  }
  return amount;
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password.").max(72),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
    email: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be 72 characters or fewer."),
    role: z.enum(["CANDIDATE", "EMPLOYER"], {
      errorMap: () => ({ message: "Choose candidate or employer." }),
    }),
    companyName: z.string().trim().max(120).default(""),
    companyLocation: z.string().trim().max(120).default(""),
  })
  .superRefine((value, ctx) => {
    if (value.role === "EMPLOYER" && value.companyName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Company name must be at least 2 characters.",
      });
    }
  });

export const jobSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
    description: z
      .string()
      .trim()
      .min(30, "Description must be at least 30 characters.")
      .max(8000),
    location: z.string().trim().min(2, "Location must be at least 2 characters.").max(120),
    employmentType: employmentTypeSchema,
    salaryMin: salaryField,
    salaryMax: salaryField,
    status: jobStatusSchema.default("OPEN"),
  })
  .superRefine((value, ctx) => {
    if (
      value.salaryMin !== undefined &&
      value.salaryMax !== undefined &&
      value.salaryMax < value.salaryMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salaryMax"],
        message: "Maximum salary must be at least the minimum.",
      });
    }
  });

export const applySchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .max(2000, "Cover letter must be 2000 characters or fewer.")
    .transform((value) => value || null),
});

export const savedSearchSchema = z.object({
  name: z.string().trim().min(2, "Name the search with at least 2 characters.").max(80),
  query: z.string().trim().max(120).default(""),
  location: z
    .string()
    .trim()
    .max(120)
    .default("")
    .transform((value) => value || null),
  employmentType: z
    .string()
    .default("")
    .transform((value) => (isEmploymentType(value) ? value : null)),
});

export const jobStatusUpdateSchema = z.object({
  jobId: z.string().min(1),
  status: jobStatusSchema,
});

export const applicationStatusSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(EMPLOYER_APPLICATION_STATUSES),
});

const boundedText = (max: number) =>
  z.unknown().transform((value) => {
    if (typeof value !== "string") return "";
    return value.trim().slice(0, max);
  });

export const jobSearchSchema = z
  .object({
    q: boundedText(120),
    location: boundedText(120),
    type: z.unknown().transform((value) => {
      if (typeof value !== "string" || !isEmploymentType(value)) return undefined;
      return value;
    }),
    page: z.unknown().transform((value) => {
      const parsed = typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
      if (!Number.isInteger(parsed) || parsed < 1) return 1;
      return parsed;
    }),
  })
  .transform((value) => ({
    q: value.q || undefined,
    location: value.location || undefined,
    type: value.type,
    page: value.page,
  }));

export type JobSearchFilters = z.infer<typeof jobSearchSchema>;
export type JobInput = z.infer<typeof jobSchema>;
