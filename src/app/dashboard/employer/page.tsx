import type { Metadata } from "next";
import Link from "next/link";
import { EMPLOYMENT_LABELS, JOB_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Employer dashboard" };

export default async function EmployerDashboardPage() {
  const user = await requireRole("EMPLOYER");
  const company = await prisma.company.findUnique({
    where: { ownerId: user.id },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { applications: true } } },
      },
    },
  });

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">{company?.name ?? "Your company"}</h1>
          <p className="mt-2 text-stone-600">
            {company?.description || "Post a role, then review the people who apply."}
          </p>
          {company?.location ? <p className="mt-1 text-sm text-stone-500">{company.location}</p> : null}
        </div>
        <Link href="/dashboard/employer/jobs/new" className="btn">
          Post a job
        </Link>
      </header>

      {!company ? (
        <div className="card p-6 text-sm text-stone-600">
          This account has no company yet. Registering as an employer creates one.
        </div>
      ) : company.jobs.length === 0 ? (
        <div className="card p-6 text-sm text-stone-600">No jobs posted yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Applications</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {company.jobs.map((job) => (
                <tr key={job.id}>
                  <td className="font-medium">{job.title}</td>
                  <td>{job.location}</td>
                  <td>{EMPLOYMENT_LABELS[job.employmentType]}</td>
                  <td>
                    <span className="pill">{JOB_STATUS_LABELS[job.status]}</span>
                  </td>
                  <td>{job._count.applications}</td>
                  <td>
                    <Link
                      className="text-pine underline"
                      href={`/dashboard/employer/jobs/${job.id}`}
                      aria-label={`Review ${job.title}`}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
