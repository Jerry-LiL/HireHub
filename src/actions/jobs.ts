"use server";

import { redirect } from "next/navigation";
import { isEmployer, ownsCompany } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  fromZodError,
  jobSchema,
  jobStatusUpdateSchema,
  readString,
  type ActionState,
} from "@/lib/validators";

export async function createJob(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!isEmployer(user)) return { error: "Only employers can post jobs." };

  const parsed = jobSchema.safeParse({
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    location: readString(formData, "location"),
    employmentType: readString(formData, "employmentType"),
    salaryMin: readString(formData, "salaryMin"),
    salaryMax: readString(formData, "salaryMax"),
    status: readString(formData, "status") || "OPEN",
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
  if (!company) return { error: "Add a company profile before posting a job." };

  const job = await prisma.job.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      employmentType: parsed.data.employmentType,
      salaryMin: parsed.data.salaryMin ?? null,
      salaryMax: parsed.data.salaryMax ?? null,
      status: parsed.data.status,
      companyId: company.id,
    },
  });

  redirect(`/dashboard/employer/jobs/${job.id}`);
}

export async function updateJobStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = jobStatusUpdateSchema.safeParse({
    jobId: readString(formData, "jobId"),
    status: readString(formData, "status"),
  });
  if (!parsed.success) return { error: "Choose a valid status." };

  const job = await prisma.job.findUnique({
    where: { id: parsed.data.jobId },
    include: { company: true },
  });
  if (!job || !ownsCompany(user, job.company.ownerId)) {
    return { error: "You cannot update this job." };
  }

  await prisma.job.update({
    where: { id: job.id },
    data: { status: parsed.data.status },
  });

  redirect(`/dashboard/employer/jobs/${job.id}?updated=1`);
}
