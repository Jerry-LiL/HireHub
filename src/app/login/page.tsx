import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { dashboardPath } from "@/lib/authz";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await currentUser();
  if (user) redirect(dashboardPath(user.role));

  return (
    <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1fr_16rem]">
      <div>
        <h1 className="font-display text-4xl">Sign in</h1>
        <p className="mt-2 text-stone-600">Candidates track applications. Employers post roles.</p>
        <div className="card mt-6 p-5">
          <LoginForm />
        </div>
        <p className="mt-4 text-sm text-stone-600">
          New here?{" "}
          <Link href="/register" className="text-pine underline">
            Create an account
          </Link>
        </p>
      </div>
      <aside className="text-sm text-stone-600">
        <p className="font-medium text-ink">Seeded accounts</p>
        <p className="mt-2">Password for each is password123.</p>
        <ul className="mt-3 space-y-2">
          <li>jordan.hale@example.com — candidate</li>
          <li>mira.chen@example.com — Lumen Labs</li>
          <li>owen.blake@example.com — Northwind</li>
        </ul>
      </aside>
    </div>
  );
}
