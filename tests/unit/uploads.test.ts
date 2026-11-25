import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESUME_MAX_BYTES } from "@/lib/constants";
import {
  displayResumeName,
  resolveResumePath,
  resumeFileLocation,
  validateResumeFile,
} from "@/lib/uploads";

describe("validateResumeFile", () => {
  it("requires a pdf or word document under 5 MB", () => {
    expect(validateResumeFile({ size: 0, type: "application/pdf", name: "resume.pdf" })).toMatch(
      /required/i,
    );
    expect(
      validateResumeFile({
        size: RESUME_MAX_BYTES + 1,
        type: "application/pdf",
        name: "resume.pdf",
      }),
    ).toMatch(/5 MB/);
    expect(
      validateResumeFile({ size: 120, type: "text/plain", name: "notes.txt" }),
    ).toMatch(/PDF or Word/);
    expect(
      validateResumeFile({ size: 120, type: "text/plain", name: "resume.pdf" }),
    ).toMatch(/PDF or Word/);
    expect(validateResumeFile({ size: 120, type: "", name: "resume.docx" })).toBeNull();
    expect(
      validateResumeFile({ size: 120, type: "application/pdf", name: "resume.pdf" }),
    ).toBeNull();
  });
});

describe("resume paths", () => {
  it("stores the file as the application id plus the extension", () => {
    const location = resumeFileLocation("clxyz123", "My Resume.PDF");
    expect(location.relativePath).toBe("resumes/clxyz123.pdf");
    expect(location.full.endsWith(`${path.sep}uploads${path.sep}resumes${path.sep}clxyz123.pdf`)).toBe(
      true,
    );
  });

  it("rejects ids and extensions that could escape the upload directory", () => {
    expect(() => resumeFileLocation("../etc", "a.pdf")).toThrow(/Invalid application id/);
    expect(() => resumeFileLocation("clxyz123", "a.txt")).toThrow(/Unsupported/);
    expect(() => resolveResumePath("../.env")).toThrow(/escapes/);
    expect(() => resolveResumePath("resumes/../../.env")).toThrow(/escapes/);
    const resolved = resolveResumePath("resumes/clxyz123.pdf");
    expect(resolved).toContain(`${path.sep}uploads${path.sep}resumes${path.sep}`);
  });

  it("strips odd characters from the download name", () => {
    expect(displayResumeName("../../weird resume.pdf")).toBe("weird resume.pdf");
    expect(displayResumeName("")).toBe("resume");
  });
});
