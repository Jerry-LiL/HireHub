"use server";

import { redirect } from "next/navigation";
import { canApplyToJob, canReviewApplication, canWithdraw, isCandidate } from "@/lib/authz";
import { isUniqueConstraint, prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { displayResumeName, saveResume, validateResumeFile } from "@/lib/uploads";
import {
  applicationStatusSchema,
  applySchema,
  fromZodError,
  readString,
  type ActionState,
} from "@/lib/validators";

export async function applyToJob(
  jobId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  if (!isCandidate(user)) return { error: "Only candidates can apply." };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || !canApplyToJob(user, job)) {
    return { error: "This role is not accepting applications." };
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId: user.id } },
  });
  if (existing) return { error: "You already applied to this role." };

  const parsed = applySchema.safeParse({ coverLetter: readString(formData, "coverLetter") });
  if (!parsed.success) return fromZodError(parsed.error);

  const resume = formData.get("resume");
  if (!(resume instanceof File)) return { error: "Resume is required." };
  const resumeError = validateResumeFile(resume);
  if (resumeError) return { error: resumeError };

  try {
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: user.id,
        coverLetter: parsed.data.coverLetter,
        resumePath: "pending",
        resumeName: displayResumeName(resume.name),
        status: "SUBMITTED",
      },
    });

    try {
      const stored = await saveResume(application.id, resume);
      await prisma.application.update({
        where: { id: application.id },
        data: {
          resumePath: stored.relativePath,
          resumeName: stored.originalName,
        },
      });
    } catch (error) {
      await prisma.application.delete({ where: { id: application.id } });
      console.error(error);
      return { error: "Could not store the resume. Try again." };
    }
  } catch (error) {
    if (isUniqueConstraint(error)) return { error: "You already applied to this role." };
    throw error;
  }

  redirect(`/jobs/${jobId}?applied=1`);
}

export async function updateApplicationStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = applicationStatusSchema.safeParse({
    applicationId: readString(formData, "applicationId"),
    status: readString(formData, "status"),
  });
  if (!parsed.success) return { error: "Choose a valid status." };

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: { job: { include: { company: true } } },
  });
  if (!application || !canReviewApplication(user, application)) {
    return { error: "You cannot update this application." };
  }
  if (application.status === "WITHDRAWN") {
    return { error: "The candidate withdrew this application." };
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { status: parsed.data.status },
  });

  redirect(`/dashboard/employer/jobs/${application.jobId}?updated=1`);
}

export async function withdrawApplication(formData: FormData) {
  const user = await requireUser();
  const id = readString(formData, "applicationId");
  const application = id ? await prisma.application.findUnique({ where: { id } }) : null;
  if (!application || !canWithdraw(user, application)) {
    redirect("/dashboard/candidate");
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { status: "WITHDRAWN" },
  });
  redirect("/dashboard/candidate");
}
