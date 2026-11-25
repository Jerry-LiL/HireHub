import { PrismaClient, type EmploymentType, type JobStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/passwords";

const prisma = new PrismaClient();

const password = "password123";

type JobSeed = {
  title: string;
  description: string;
  location: string;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  status: JobStatus;
  hours: number;
};

const lumenJobs: JobSeed[] = [
  {
    title: "Backend Engineer",
    location: "Berlin",
    employmentType: "FULL_TIME",
    salaryMin: 120000,
    salaryMax: 150000,
    status: "OPEN",
    hours: 1,
    description:
      "Build the APIs behind Lumen's hiring tools. The work sits on PostgreSQL, a short queue of background jobs, and the partner integrations customers actually call.",
  },
  {
    title: "Product Designer",
    location: "Remote",
    employmentType: "FULL_TIME",
    salaryMin: 110000,
    salaryMax: 140000,
    status: "OPEN",
    hours: 2,
    description:
      "Shape the candidate and employer experience, from the first search through to the offer. We care about readable type, honest empty states, and interviews with people who use the product.",
  },
  {
    title: "Platform Engineer",
    location: "Berlin",
    employmentType: "FULL_TIME",
    salaryMin: 140000,
    salaryMax: 170000,
    status: "OPEN",
    hours: 3,
    description:
      "Own the deployment pipeline and the shared libraries product teams ship on. On-call is one week in six, and most of the work is reliability rather than a new surface.",
  },
  {
    title: "Support Engineer",
    location: "Remote",
    employmentType: "CONTRACT",
    salaryMin: 80000,
    salaryMax: 100000,
    status: "OPEN",
    hours: 4,
    description:
      "Help customer teams debug failed imports and odd permissions. This contract runs about six months, with a conversation at the end if both sides want to continue.",
  },
];

const northwindJobs: JobSeed[] = [
  {
    title: "Data Analyst",
    location: "Austin",
    employmentType: "FULL_TIME",
    salaryMin: 90000,
    salaryMax: 115000,
    status: "OPEN",
    hours: 5,
    description:
      "Northwind's operations team needs someone who can turn warehouse and hiring numbers into a weekly note managers will actually read.",
  },
  {
    title: "Warehouse Intern",
    location: "Austin",
    employmentType: "INTERNSHIP",
    salaryMin: 40000,
    salaryMax: 48000,
    status: "OPEN",
    hours: 6,
    description:
      "A summer internship split between the Austin warehouse floor and the small tools shift leads use. Prior logistics experience is not required.",
  },
  {
    title: "Recruiter",
    location: "Austin",
    employmentType: "PART_TIME",
    salaryMin: 55000,
    salaryMax: 70000,
    status: "OPEN",
    hours: 7,
    description:
      "Part-time recruiting for Northwind's operations roles. You will run screens, keep the pipeline tidy, and sit with hiring managers once a week.",
  },
  {
    title: "Finance Associate",
    location: "London",
    employmentType: "FULL_TIME",
    salaryMin: 70000,
    salaryMax: 90000,
    status: "OPEN",
    hours: 8,
    description:
      "Close the books for the London entity. The role is full-time and reports to the controller, with a steady month-end rather than a surprise close.",
  },
  {
    title: "Legacy PHP Contractor",
    location: "Remote",
    employmentType: "CONTRACT",
    salaryMin: 90000,
    salaryMax: 110000,
    status: "CLOSED",
    hours: 9,
    description:
      "Maintain an old internal tool while it moves off PHP. This role is closed and should not appear in search.",
  },
  {
    title: "Staff Engineer",
    location: "Berlin",
    employmentType: "FULL_TIME",
    salaryMin: 180000,
    salaryMax: 210000,
    status: "DRAFT",
    hours: 10,
    description:
      "A draft posting for a staff engineer who would lead the Berlin product group. It is not published yet.",
  },
];

function postedAt(hours: number) {
  return new Date(Date.UTC(2026, 0, 10, hours, 0, 0));
}

async function createJobs(companyId: string, jobs: JobSeed[]) {
  for (const job of jobs) {
    const { hours, ...data } = job;
    await prisma.job.create({
      data: {
        ...data,
        companyId,
        createdAt: postedAt(hours),
      },
    });
  }
}

async function main() {
  const passwordHash = await hashPassword(password);

  await prisma.application.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const jordan = await prisma.user.create({
    data: {
      name: "Jordan Hale",
      email: "jordan.hale@example.com",
      passwordHash,
      role: "CANDIDATE",
    },
  });

  const mira = await prisma.user.create({
    data: {
      name: "Mira Chen",
      email: "mira.chen@example.com",
      passwordHash,
      role: "EMPLOYER",
    },
  });

  const owen = await prisma.user.create({
    data: {
      name: "Owen Blake",
      email: "owen.blake@example.com",
      passwordHash,
      role: "EMPLOYER",
    },
  });

  const lumen = await prisma.company.create({
    data: {
      name: "Lumen Labs",
      website: "https://lumen.example",
      location: "Berlin",
      description: "Lumen Labs builds hiring software for teams that do not want a dozen tabs.",
      ownerId: mira.id,
    },
  });

  const northwind = await prisma.company.create({
    data: {
      name: "Northwind",
      website: "https://northwind.example",
      location: "Austin",
      description: "Northwind runs warehouses and a small London finance office.",
      ownerId: owen.id,
    },
  });

  await createJobs(lumen.id, lumenJobs);
  await createJobs(northwind.id, northwindJobs);

  console.log(`Seeded ${jordan.email}, ${mira.email}, and ${owen.email}. Password: ${password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
