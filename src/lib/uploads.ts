import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { RESUME_MAX_BYTES } from "@/lib/constants";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function validateResumeFile(file: { size: number; type: string; name: string }) {
  if (!file || file.size <= 0) return "Resume is required.";
  if (file.size > RESUME_MAX_BYTES) return "Resume must be 5 MB or smaller.";
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return "Upload a PDF or Word document.";
  if (file.type && !ALLOWED_TYPES.has(file.type)) return "Upload a PDF or Word document.";
  return null;
}

export function displayResumeName(name: string) {
  const base = path.basename(name).replace(/[^\w.\- ()]/g, "");
  return base.slice(0, 120) || "resume";
}

export function resumeFileLocation(applicationId: string, originalName: string) {
  if (!/^[a-z0-9]+$/i.test(applicationId)) {
    throw new Error("Invalid application id");
  }
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error("Unsupported resume type");
  }
  const filename = `${applicationId}${ext}`;
  const dir = path.join(process.cwd(), "uploads", "resumes");
  return {
    dir,
    full: path.join(dir, filename),
    relativePath: path.posix.join("resumes", filename),
    filename,
  };
}

export function resolveResumePath(relativePath: string) {
  const root = path.resolve(process.cwd(), "uploads", "resumes");
  const full = path.resolve(process.cwd(), "uploads", relativePath);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error("Resume path escapes the upload directory");
  }
  return full;
}

export function resumeContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}

export async function saveResume(
  applicationId: string,
  file: { name: string; arrayBuffer: () => Promise<ArrayBuffer> },
) {
  const location = resumeFileLocation(applicationId, file.name);
  await mkdir(location.dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(location.full, bytes);
  return {
    relativePath: location.relativePath,
    originalName: displayResumeName(file.name),
  };
}
