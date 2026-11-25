import type { Metadata } from "next";
import Link from "next/link";
import { deleteSavedSearch } from "@/actions/saved-searches";
import { EMPLOYMENT_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { savedSearchHref } from "@/lib/search";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Saved searches" };

export default async function SavedSearchesPage() {
  const user = await requireRole("CANDIDATE");
  const searches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-4xl">Saved searches</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Each search stores the keyword, location, and employment type. Opening one brings those
        filters back into the URL.
      </p>

      {searches.length === 0 ? (
        <div className="card mt-6 p-6 text-sm text-stone-600">
          No saved searches yet.{" "}
          <Link href="/" className="text-pine underline">
            Filter the board
          </Link>{" "}
          and give the search a name.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {searches.map((search) => {
            const bits = [
              search.query || "Any keyword",
              search.location || "Any location",
              search.employmentType ? EMPLOYMENT_LABELS[search.employmentType] : "Any type",
            ];
            return (
              <li key={search.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <Link href={savedSearchHref(search)} className="font-display text-2xl hover:text-pine">
                    {search.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone-600">
                    {bits.join(" · ")} · Saved {formatDate(search.createdAt)}
                  </p>
                </div>
                <form action={deleteSavedSearch}>
                  <input type="hidden" name="id" value={search.id} />
                  <button className="btn-secondary" type="submit" aria-label={`Delete ${search.name}`}>
                    Delete
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
