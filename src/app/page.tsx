import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JobSearchForm } from "@/components/job-search-form";
import { Pagination } from "@/components/pagination";
import { SaveSearchForm } from "@/components/save-search-form";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { formatSalary } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  buildJobWhere,
  jobSearchHref,
  paginate,
  parseJobSearchParams,
  rawQueryPath,
} from "@/lib/search";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Open roles" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseJobSearchParams(searchParams);
  if (rawQueryPath(searchParams) !== jobSearchHref(filters)) {
    redirect(jobSearchHref(filters));
  }

  const where = buildJobWhere(filters);
  const total = await prisma.job.count({ where });
  const page = paginate(filters.page, total);
  if (page.page !== filters.page) {
    redirect(jobSearchHref({ ...filters, page: page.page }));
  }

  const [jobs, locationRows, user] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.pageSize,
      include: { company: { select: { name: true } } },
    }),
    prisma.job.findMany({
      where: { status: "OPEN" },
      distinct: ["location"],
      select: { location: true },
    }),
    currentUser(),
  ]);

  const locations = locationRows.map((row) => row.location).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-4xl tracking-tight">Open roles</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Search by keyword, city, or employment type. Location matches the full city name, and the
          filters stay in the URL.
        </p>
      </header>

      <JobSearchForm filters={filters} locations={locations} />
      <p className="mt-2 text-xs text-stone-500">Location is an exact match. Keywords are not.</p>

      <p className="mb-3 mt-8 text-sm text-stone-600">
        {page.total} open {page.total === 1 ? "role" : "roles"}
      </p>

      {jobs.length === 0 ? (
        <div className="card p-6 text-sm text-stone-600">No open roles match these filters.</div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/jobs/${job.id}`} className="font-display text-2xl hover:text-pine">
                  {job.title}
                </Link>
                <span className="text-sm text-stone-600">{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
              <p className="mt-1 text-sm text-stone-600">
                {job.company.name} · {job.location} · {EMPLOYMENT_LABELS[job.employmentType]}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Pagination filters={filters} page={page} />

      {user?.role === "CANDIDATE" ? (
        <SaveSearchForm filters={filters} />
      ) : user ? null : (
        <p className="mt-8 text-sm text-stone-600">
          <Link href="/login" className="text-pine underline">
            Sign in
          </Link>{" "}
          to save this search.
        </p>
      )}
    </div>
  );
}
