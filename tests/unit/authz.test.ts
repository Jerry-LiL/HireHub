import { describe, expect, it } from "vitest";
import {
  canApplyToJob,
  canReviewApplication,
  canViewResume,
  canWithdraw,
  dashboardPath,
  ownsCompany,
  type SessionUser,
} from "@/lib/authz";

const candidate: SessionUser = { id: "cand", role: "CANDIDATE", name: "Jordan" };
const employer: SessionUser = { id: "emp", role: "EMPLOYER", name: "Mira" };
const otherEmployer: SessionUser = { id: "other", role: "EMPLOYER", name: "Owen" };

const application = {
  candidateId: "cand",
  status: "SUBMITTED",
  job: { company: { ownerId: "emp" } },
};

describe("role helpers", () => {
  it("sends each role to its own dashboard", () => {
    expect(dashboardPath("CANDIDATE")).toBe("/dashboard/candidate");
    expect(dashboardPath("EMPLOYER")).toBe("/dashboard/employer");
  });

  it("lets only the owning employer manage a company", () => {
    expect(ownsCompany(employer, "emp")).toBe(true);
    expect(ownsCompany(otherEmployer, "emp")).toBe(false);
    expect(ownsCompany(candidate, "emp")).toBe(false);
    expect(ownsCompany(null, "emp")).toBe(false);
  });
});

describe("application access", () => {
  it("lets a candidate apply only to an open role", () => {
    expect(canApplyToJob(candidate, { status: "OPEN" })).toBe(true);
    expect(canApplyToJob(candidate, { status: "CLOSED" })).toBe(false);
    expect(canApplyToJob(employer, { status: "OPEN" })).toBe(false);
  });

  it("lets the hiring employer review, and the candidate withdraw once", () => {
    expect(canReviewApplication(employer, application)).toBe(true);
    expect(canReviewApplication(otherEmployer, application)).toBe(false);
    expect(canWithdraw(candidate, application)).toBe(true);
    expect(canWithdraw(candidate, { ...application, status: "WITHDRAWN" })).toBe(false);
    expect(canWithdraw(employer, application)).toBe(false);
  });

  it("shows a resume to the applicant and the hiring employer", () => {
    expect(canViewResume(candidate, application)).toBe(true);
    expect(canViewResume(employer, application)).toBe(true);
    expect(canViewResume(otherEmployer, application)).toBe(false);
    expect(canViewResume({ ...candidate, id: "someone" }, application)).toBe(false);
    expect(canViewResume(null, application)).toBe(false);
  });
});
