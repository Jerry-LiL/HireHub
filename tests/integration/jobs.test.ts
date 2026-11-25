import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { buildJobWhere, paginate } from "@/lib/search";
import { hashPassword } from "@/lib/passwords";

const prisma = new PrismaClient();

describe("job search against Postgres", () => {
  let employerId = "";
  let candidateId = "";
  const stamp = `itest-${Date.now()}`;

  beforeAll(async () => {
    const passwordHash = await hashPassword("password123");
    const employer = await prisma.user.create({
      data: {
        name: "Integration Employer",
        email: `${stamp}-employer@example.com`,
        passwordHash,
        role: "EMPLOYER",
      },
    });
    const candidate = await prisma.user.create({
      data: {
        name: "Integration Candidate",
        email: `${stamp}-candidate@example.com`,
        passwordHash,
        role: "CANDIDATE",
      },
    });
    employerId = employer.id;
    candidateId = candidate.id;

    const company = await prisma.company.create({
      data: { name: `${stamp} Labs`, ownerId: employer.id, location: "Berlin" },
    });

    await prisma.job.createMany({
      data: [
        {
          title: `${stamp} Open Role`,
          description: "An open role used by the integration test.",
          location: "Berlin",
          employmentType: "FULL_TIME",
          status: "OPEN",
          companyId: company.id,
          createdAt: new Date("2026-02-01T00:00:00.000Z"),
        },
        {
          title: `${stamp} Closed Role`,
          description: "A closed role that search should skip.",
          location: "Berlin",
          employmentType: "FULL_TIME",
          status: "CLOSED",
          companyId: company.id,
          createdAt: new Date("2026-02-02T00:00:00.000Z"),
        },
        {
          title: `${stamp} Contract Role`,
          description: "A contract role in Austin.",
          location: "Austin",
          employmentType: "CONTRACT",
          status: "OPEN",
          companyId: company.id,
          createdAt: new Date("2026-02-03T00:00:00.000Z"),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [employerId, candidateId].filter(Boolean) } },
    });
    await prisma.$disconnect();
  });

  it("returns open roles for the keyword and keeps closed ones out", async () => {
    const where = buildJobWhere({ q: stamp });
    const total = await prisma.job.count({ where });
    const page = paginate(1, total);
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.pageSize,
    });

    expect(total).toBe(2);
    expect(jobs.map((job) => job.title)).toEqual([
      `${stamp} Contract Role`,
      `${stamp} Open Role`,
    ]);
  });

  it("filters location and employment type together", async () => {
    const jobs = await prisma.job.findMany({
      where: buildJobWhere({ q: stamp, location: "Austin", type: "CONTRACT" }),
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.title).toBe(`${stamp} Contract Role`);
  });

  it("rejects a second application for the same candidate and job", async () => {
    const job = await prisma.job.findFirstOrThrow({
      where: { title: `${stamp} Open Role` },
    });
    await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId,
        resumePath: "resumes/pending.pdf",
        resumeName: "resume.pdf",
      },
    });
    await expect(
      prisma.application.create({
        data: {
          jobId: job.id,
          candidateId,
          resumePath: "resumes/pending.pdf",
          resumeName: "resume.pdf",
        },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("has the composite indexes the board queries rely on", async () => {
    const rows = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('Job', 'Application', 'SavedSearch')
    `;
    const names = rows.map((row) => row.indexname);
    expect(names).toEqual(
      expect.arrayContaining([
        "Job_status_createdAt_idx",
        "Job_companyId_status_idx",
        "Job_location_employmentType_idx",
        "Application_jobId_candidateId_key",
        "Application_candidateId_status_idx",
        "Application_jobId_status_idx",
        "SavedSearch_userId_createdAt_idx",
      ]),
    );
  });
});
