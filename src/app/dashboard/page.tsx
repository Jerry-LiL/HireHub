import { redirect } from "next/navigation";
import { dashboardPath } from "@/lib/authz";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  redirect(dashboardPath(user.role));
}
