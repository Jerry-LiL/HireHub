import type { Prisma } from "@prisma/client";
import { PAGE_SIZE, type EmploymentType } from "@/lib/constants";
import { jobSearchSchema, type JobSearchFilters } from "@/lib/validators";

export type JobQuery = {
  q?: string;
  location?: string;
  type?: EmploymentType;
  page?: number;
};

export type PageInfo = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  skip: number;
};

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseJobSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): JobSearchFilters {
  return jobSearchSchema.parse({
    q: firstParam(searchParams.q),
    location: firstParam(searchParams.location),
    type: firstParam(searchParams.type),
    page: firstParam(searchParams.page),
  });
}

export function paginate(requested: number, total: number, pageSize = PAGE_SIZE): PageInfo {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requested || 1), totalPages);
  return {
    page,
    pageSize,
    total,
    totalPages,
    skip: (page - 1) * pageSize,
  };
}

export function buildJobWhere(filters: JobQuery): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: "OPEN" };

  if (filters.location) {
    where.location = filters.location;
  }
  if (filters.type) {
    where.employmentType = filters.type;
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { company: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export function jobSearchHref(filters: JobQuery) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.location) params.set("location", filters.location);
  if (filters.type) params.set("type", filters.type);
  if ((filters.page ?? 1) > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function rawQueryPath(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const key of ["q", "location", "type", "page"] as const) {
    const value = firstParam(searchParams[key]);
    if (value !== undefined) params.append(key, value);
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function savedSearchHref(search: {
  query: string;
  location: string | null;
  employmentType: EmploymentType | null;
}) {
  return jobSearchHref({
    q: search.query || undefined,
    location: search.location || undefined,
    type: search.employmentType ?? undefined,
    page: 1,
  });
}
