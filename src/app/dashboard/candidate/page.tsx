import type { Metadata } from "next";
import Link from "next/link";
import { withdrawApplication } from "@/actions/applications";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { canWithdraw } from "@/lib/authz";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Your applications" };

export default async function CandidateDashboardPage() {
  const user = await requireRole("CANDIDATE");
  const applications = await prisma.application.findMany({
    where: { candidateId: user.id },
    orderBy: { createdAt: "desc" },
    include: { job: { include: { company: true } } },
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-4xl">Your applications</h1>
        <p className="mt-2 text-stone-600">
          {user.name}, these are the roles you have applied to.{" "}
          <Link href="/saved-searches" className="text-pine underline">
            Saved searches
          </Link>{" "}
          keep a filter around for later.
        </p>
      </header>

      {applications.length === 0 ? (
        <div className="card p-6 text-sm text-stone-600">
          You have not applied yet.{" "}
          <Link href="/" className="text-pine underline">
            Browse open roles
          </Link>
          .
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Company</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Resume</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <Link href={`/jobs/${application.jobId}`} className="font-medium hover:text-pine">
                      {application.job.title}
                    </Link>
                  </td>
                  <td>{application.job.company.name}</td>
                  <td>
                    <span className="pill">{APPLICATION_STATUS_LABELS[application.status]}</span>
                  </td>
                  <td>{formatDate(application.createdAt)}</td>
                  <td>
                    <Link
                      className="text-pine underline"
                      href={`/api/resumes/${application.id}`}
                      aria-label={`Download resume for ${application.job.title}`}
                    >
                      Resume
                    </Link>
                  </td>
                  <td>
                    {canWithdraw(user, application) ? (
                      <form action={withdrawApplication}>
                        <input type="hidden" name="applicationId" value={application.id} />
                        <button
                          className="btn-secondary"
                          type="submit"
                          aria-label={`Withdraw ${application.job.title}`}
                        >
                          Withdraw
                        </button>
                      </form>
                    ) : null}
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
