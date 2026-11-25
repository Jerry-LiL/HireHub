import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dashboardPath, type Role, type SessionUser } from "@/lib/authz";

function isRole(value: unknown): value is Role {
  return value === "CANDIDATE" || value === "EMPLOYER";
}

export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !isRole(session.user.role)) return null;
  return {
    id: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  };
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) redirect(dashboardPath(user.role));
  return user;
}
