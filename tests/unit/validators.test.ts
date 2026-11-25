import { describe, expect, it } from "vitest";
import { EmploymentType, JobStatus } from "@prisma/client";
import { EMPLOYMENT_TYPES, JOB_STATUSES } from "@/lib/constants";
import {
  applicationStatusSchema,
  jobSchema,
  jobSearchSchema,
  readString,
  registerSchema,
  savedSearchSchema,
} from "@/lib/validators";

const validJob = {
  title: "Backend Engineer",
  description: "Build the APIs behind the hiring tools our customers use every week.",
  location: "Berlin",
  employmentType: "FULL_TIME",
  salaryMin: "120000",
  salaryMax: "150000",
  status: "OPEN",
};

describe("registerSchema", () => {
  it("requires a company name for employers", () => {
    const result = registerSchema.safeParse({
      name: "Mira Chen",
      email: "Mira@Example.com",
      password: "password123",
      role: "EMPLOYER",
      companyName: " ",
      companyLocation: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.companyName?.[0]).toMatch(/Company name/);
    }
  });

  it("lowercases email and allows candidates without a company", () => {
    const result = registerSchema.safeParse({
      name: "Jordan Hale",
      email: "Jordan@Example.com",
      password: "password123",
      role: "CANDIDATE",
      companyName: "",
      companyLocation: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("jordan@example.com");
  });
});

describe("jobSchema", () => {
  it("accepts a complete posting and coerces salaries", () => {
    const result = jobSchema.safeParse(validJob);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salaryMin).toBe(120000);
      expect(result.data.salaryMax).toBe(150000);
    }
  });

  it("rejects a max salary below the minimum", () => {
    const result = jobSchema.safeParse({ ...validJob, salaryMin: "150000", salaryMax: "100000" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.salaryMax?.[0]).toMatch(/Maximum salary/);
    }
  });

  it("rejects a short title", () => {
    const result = jobSchema.safeParse({ ...validJob, title: "Ab" });
    expect(result.success).toBe(false);
  });

  it("allows blank salaries", () => {
    const result = jobSchema.safeParse({ ...validJob, salaryMin: "", salaryMax: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salaryMin).toBeUndefined();
      expect(result.data.salaryMax).toBeUndefined();
    }
  });
});

describe("jobSearchSchema", () => {
  it("drops an unknown employment type and repairs a bad page", () => {
    const result = jobSearchSchema.parse({
      q: "  engineer  ",
      location: "",
      type: "NOPE",
      page: "0",
    });
    expect(result).toEqual({ q: "engineer", location: undefined, type: undefined, page: 1 });
  });

  it("keeps a valid filter set", () => {
    const result = jobSearchSchema.parse({
      q: "analyst",
      location: "Austin",
      type: "FULL_TIME",
      page: "2",
    });
    expect(result).toEqual({
      q: "analyst",
      location: "Austin",
      type: "FULL_TIME",
      page: 2,
    });
  });
});

describe("saved searches and status updates", () => {
  it("stores an empty employment type as null", () => {
    const result = savedSearchSchema.parse({
      name: "Berlin roles",
      query: "engineer",
      location: "Berlin",
      employmentType: "",
    });
    expect(result.employmentType).toBeNull();
    expect(result.location).toBe("Berlin");
  });

  it("rejects a withdrawn status from the employer form", () => {
    const result = applicationStatusSchema.safeParse({
      applicationId: "abc",
      status: "WITHDRAWN",
    });
    expect(result.success).toBe(false);
  });
});

describe("enum parity", () => {
  it("matches the Prisma employment and job status enums", () => {
    expect([...EMPLOYMENT_TYPES].sort()).toEqual(Object.values(EmploymentType).sort());
    expect([...JOB_STATUSES].sort()).toEqual(Object.values(JobStatus).sort());
  });
});

describe("readString", () => {
  it("reads strings and ignores missing or file fields", () => {
    const formData = new FormData();
    formData.set("title", "Backend");
    formData.set("resume", new Blob(["%PDF"]), "resume.pdf");
    expect(readString(formData, "title")).toBe("Backend");
    expect(readString(formData, "missing")).toBe("");
    expect(readString(formData, "resume")).toBe("");
  });
});
