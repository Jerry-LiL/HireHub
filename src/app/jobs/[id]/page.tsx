import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/apply-form";
import { APPLICATION_STATUS_LABELS, EMPLOYMENT_LABELS, JOB_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/format";
import { ownsCompany } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: job?.title ?? "Job" };
}

export default async function JobPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { company: true },
  });
  if (!job) notFound();

  const user = await currentUser();
  const owner = ownsCompany(user, job.company.ownerId);
  if (job.status === "DRAFT" && !owner) notFound();

  const application =
    user?.role === "CANDIDATE"
      ? await prisma.application.findUnique({
          where: { jobId_candidateId: { jobId: job.id, candidateId: user.id } },
        })
      : null;

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-sm text-stone-500">
        <Link href="/" className="hover:text-pine">
          Open roles
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">{job.title}</h1>
      <p className="mt-2 text-stone-600">
        {job.company.name} · {job.location} · {EMPLOYMENT_LABELS[job.employmentType]}
      </p>
      <p className="mt-1 text-sm text-stone-600">{formatSalary(job.salaryMin, job.salaryMax)}</p>
      {job.status !== "OPEN" ? (
        <p className="mt-3">
          <span className="pill">{JOB_STATUS_LABELS[job.status]}</span>
        </p>
      ) : null}

      {job.company.description ? (
        <p className="mt-6 text-sm text-stone-600">{job.company.description}</p>
      ) : null}
      {job.company.website ? (
        <p className="mt-1 text-sm">
          <a className="text-pine underline" href={job.company.website}>
            {job.company.website.replace(/^https?:\/\//, "")}
          </a>
        </p>
      ) : null}

      <div className="mt-6 whitespace-pre-wrap leading-relaxed">{job.description}</div>

      <section className="card mt-8 p-5">
        <h2 className="font-display text-2xl">Apply</h2>
        {application ? (
          <div className="mt-3 space-y-2 text-sm">
            {application.status === "SUBMITTED" || searchParams.applied === "1" ? (
              <p className="banner">Application submitted.</p>
            ) : null}
            <p>
              Status: {APPLICATION_STATUS_LABELS[application.status]}. Applied{" "}
              {formatDate(application.createdAt)}.
            </p>
            <p>
              <Link className="text-pine underline" href={`/api/resumes/${application.id}`}>
                Download resume
              </Link>
            </p>
          </div>
        ) : user?.role === "CANDIDATE" && job.status === "OPEN" ? (
          <div className="mt-4">
            <ApplyForm jobId={job.id} />
          </div>
        ) : user?.role === "EMPLOYER" ? (
          <p className="mt-3 text-sm text-stone-600">Employer accounts cannot apply.</p>
        ) : job.status !== "OPEN" ? (
          <p className="mt-3 text-sm text-stone-600">This role is not accepting applications.</p>
        ) : (
          <p className="mt-3 text-sm text-stone-600">
            <Link href="/login" className="text-pine underline">
              Sign in
            </Link>{" "}
            as a candidate to apply.
          </p>
        )}
        {owner ? (
          <p className="mt-4 text-sm">
            <Link className="text-pine underline" href={`/dashboard/employer/jobs/${job.id}`}>
              Review applications
            </Link>
          </p>
        ) : null}
      </section>
    </article>
  );
}
