import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationStatusForm, JobStatusForm } from "@/components/status-forms";
import { APPLICATION_STATUS_LABELS, EMPLOYMENT_LABELS } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await prisma.job.findUnique({ where: { id: params.id }, select: { title: true } });
  return { title: job?.title ?? "Job" };
}

export default async function EmployerJobPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireRole("EMPLOYER");
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      applications: {
        orderBy: { createdAt: "desc" },
        include: { candidate: { select: { name: true, email: true } } },
      },
    },
  });

  if (!job || job.company.ownerId !== user.id) notFound();

  return (
    <div>
      <p className="text-sm">
        <Link href="/dashboard/employer" className="text-pine underline">
          Dashboard
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl">{job.title}</h1>
      <p className="mt-2 text-stone-600">
        {job.location} · {EMPLOYMENT_LABELS[job.employmentType]} · {formatSalary(job.salaryMin, job.salaryMax)}
      </p>
      {searchParams.updated === "1" ? <p className="banner mt-4">Status updated.</p> : null}

      <div className="card mt-6 p-5">
        <JobStatusForm jobId={job.id} status={job.status} />
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{job.description}</p>
      </div>

      <h2 className="mb-3 mt-8 font-display text-2xl">Applications</h2>
      {job.applications.length === 0 ? (
        <div className="card p-6 text-sm text-stone-600">No applications yet.</div>
      ) : (
        <ul className="space-y-3">
          {job.applications.map((application) => (
            <li key={application.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-medium">{application.candidate.name}</h3>
                <span className="pill">{APPLICATION_STATUS_LABELS[application.status]}</span>
              </div>
              <p className="mt-1 text-sm text-stone-600">
                {application.candidate.email} · Applied {formatDate(application.createdAt)}
              </p>
              {application.coverLetter ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{application.coverLetter}</p>
              ) : (
                <p className="mt-3 text-sm text-stone-500">No cover letter.</p>
              )}
              <p className="mt-3 text-sm">
                <Link
                  className="text-pine underline"
                  href={`/api/resumes/${application.id}`}
                  aria-label={`Download resume for ${application.candidate.name}`}
                >
                  {application.resumeName}
                </Link>
              </p>
              {application.status === "WITHDRAWN" ? (
                <p className="mt-3 text-sm text-stone-500">The candidate withdrew this application.</p>
              ) : (
                <div className="mt-4">
                  <ApplicationStatusForm
                    applicationId={application.id}
                    candidateName={application.candidate.name}
                    status={application.status}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
