import type { Metadata } from "next";
import Link from "next/link";
import { JobForm } from "@/components/job-form";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Post a job" };

export default async function NewJobPage() {
  await requireRole("EMPLOYER");

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm">
        <Link href="/dashboard/employer" className="text-pine underline">
          Dashboard
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl">Post a job</h1>
      <p className="mt-2 text-stone-600">
        Open roles show up in search. Drafts stay on your dashboard until you publish them.
      </p>
      <div className="card mt-6 p-5">
        <JobForm />
      </div>
    </div>
  );
}
