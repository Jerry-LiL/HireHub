import { readFile } from "node:fs/promises";
import { canViewResume } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { resolveResumePath, resumeContentType } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: { job: { include: { company: true } } },
  });
  if (!application || !canViewResume(user, application) || application.resumePath === "pending") {
    return new Response("Not found", { status: 404 });
  }

  let full: string;
  try {
    full = resolveResumePath(application.resumePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await readFile(full);
  const filename = application.resumeName.replace(/"/g, "");

  return new Response(bytes, {
    headers: {
      "Content-Type": resumeContentType(application.resumeName),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
