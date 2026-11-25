import { describe, expect, it } from "vitest";
import {
  buildJobWhere,
  jobSearchHref,
  paginate,
  parseJobSearchParams,
  rawQueryPath,
  savedSearchHref,
} from "@/lib/search";

describe("parseJobSearchParams", () => {
  it("uses the first value when a key is repeated", () => {
    expect(
      parseJobSearchParams({
        q: ["designer", "ignored"],
        location: "Remote",
        type: "CONTRACT",
        page: "3",
      }),
    ).toEqual({
      q: "designer",
      location: "Remote",
      type: "CONTRACT",
      page: 3,
    });
  });
});

describe("paginate", () => {
  it("clamps the requested page into range", () => {
    expect(paginate(1, 0)).toMatchObject({ page: 1, totalPages: 1, skip: 0, total: 0 });
    expect(paginate(3, 8)).toMatchObject({ page: 2, totalPages: 2, skip: 5, pageSize: 5 });
    expect(paginate(0, 8).page).toBe(1);
  });
});

describe("buildJobWhere", () => {
  it("limits the board to open roles and ANDs the filters", () => {
    expect(
      buildJobWhere({ q: "lumen", location: "Berlin", type: "FULL_TIME" }),
    ).toEqual({
      status: "OPEN",
      location: "Berlin",
      employmentType: "FULL_TIME",
      OR: [
        { title: { contains: "lumen", mode: "insensitive" } },
        { description: { contains: "lumen", mode: "insensitive" } },
        { company: { name: { contains: "lumen", mode: "insensitive" } } },
      ],
    });
  });

  it("leaves optional filters off when they are empty", () => {
    expect(buildJobWhere({})).toEqual({ status: "OPEN" });
  });
});

describe("hrefs", () => {
  it("omits empty filters and the first page", () => {
    expect(jobSearchHref({ q: "backend engineer", page: 1 })).toBe("/?q=backend+engineer");
    expect(jobSearchHref({ page: 1 })).toBe("/");
    expect(jobSearchHref({ location: "Berlin", type: "FULL_TIME", page: 2 })).toBe(
      "/?location=Berlin&type=FULL_TIME&page=2",
    );
  });

  it("keeps blank submitted fields so the page can redirect to the canonical URL", () => {
    expect(rawQueryPath({ q: "engineer", location: "", type: "" })).toBe(
      "/?q=engineer&location=&type=",
    );
    expect(jobSearchHref(parseJobSearchParams({ q: "engineer", location: "", type: "" }))).toBe(
      "/?q=engineer",
    );
  });

  it("turns a saved search back into the same query string", () => {
    expect(
      savedSearchHref({ query: "analyst", location: "Austin", employmentType: "FULL_TIME" }),
    ).toBe("/?q=analyst&location=Austin&type=FULL_TIME");
  });
});
