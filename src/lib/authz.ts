export type Role = "CANDIDATE" | "EMPLOYER";

export type SessionUser = {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
};

export function dashboardPath(role: Role) {
  return role === "EMPLOYER" ? "/dashboard/employer" : "/dashboard/candidate";
}

export function isEmployer(user: SessionUser | null): user is SessionUser {
  return !!user && user.role === "EMPLOYER";
}

export function isCandidate(user: SessionUser | null): user is SessionUser {
  return !!user && user.role === "CANDIDATE";
}

export function ownsCompany(user: SessionUser | null, ownerId: string) {
  return isEmployer(user) && user.id === ownerId;
}

export function canApplyToJob(user: SessionUser | null, job: { status: string }) {
  return isCandidate(user) && job.status === "OPEN";
}

export function canReviewApplication(
  user: SessionUser | null,
  application: { job: { company: { ownerId: string } } },
) {
  return ownsCompany(user, application.job.company.ownerId);
}

export function canWithdraw(
  user: SessionUser | null,
  application: { candidateId: string; status: string },
) {
  return isCandidate(user) && user.id === application.candidateId && application.status !== "WITHDRAWN";
}

export function canViewResume(
  user: SessionUser | null,
  application: { candidateId: string; job: { company: { ownerId: string } } },
) {
  if (!user) return false;
  if (user.role === "CANDIDATE") return user.id === application.candidateId;
  return user.id === application.job.company.ownerId;
}
