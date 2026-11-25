import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import { dashboardPath, type SessionUser } from "@/lib/authz";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="border-b border-line bg-paper/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          HireHub
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-pine">
            Jobs
          </Link>
          {user ? (
            <>
              <Link href={dashboardPath(user.role)} className="hover:text-pine">
                Dashboard
              </Link>
              {user.role === "CANDIDATE" ? (
                <Link href="/saved-searches" className="hover:text-pine">
                  Saved searches
                </Link>
              ) : null}
              <form action={signOutAction}>
                <button className="btn-quiet" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-pine">
                Sign in
              </Link>
              <Link href="/register" className="btn">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
