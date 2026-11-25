import Link from "next/link";
import { jobSearchHref, type PageInfo } from "@/lib/search";
import type { JobSearchFilters } from "@/lib/validators";

export function Pagination({ filters, page }: { filters: JobSearchFilters; page: PageInfo }) {
  if (page.totalPages <= 1) return null;

  return (
    <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pagination">
      {page.page > 1 ? (
        <Link className="btn-secondary" href={jobSearchHref({ ...filters, page: page.page - 1 })}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {page.page} of {page.totalPages}
      </span>
      {page.page < page.totalPages ? (
        <Link className="btn-secondary" href={jobSearchHref({ ...filters, page: page.page + 1 })}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
