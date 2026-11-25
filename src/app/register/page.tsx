import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { dashboardPath } from "@/lib/authz";
import { currentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await currentUser();
  if (user) redirect(dashboardPath(user.role));

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-4xl">Create an account</h1>
      <p className="mt-2 text-stone-600">
        Employers get a company and a posting form. Candidates can apply and save searches.
      </p>
      <div className="card mt-6 p-5">
        <RegisterForm />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        Already registered?{" "}
        <Link href="/login" className="text-pine underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
