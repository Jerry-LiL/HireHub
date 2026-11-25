import { describe, expect, it } from "vitest";
import { formatDate, formatSalary } from "@/lib/format";

describe("formatters", () => {
  it("formats a salary range and the gaps around it", () => {
    expect(formatSalary(120000, 150000)).toBe("$120,000 – $150,000");
    expect(formatSalary(90000, null)).toBe("From $90,000");
    expect(formatSalary(null, 80000)).toBe("Up to $80,000");
    expect(formatSalary(null, null)).toBe("Salary not listed");
  });

  it("formats dates in UTC so the board does not shift a day", () => {
    expect(formatDate(new Date("2026-01-10T00:30:00.000Z"))).toBe("Jan 10, 2026");
  });
});
