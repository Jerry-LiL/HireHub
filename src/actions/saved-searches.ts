"use server";

import { redirect } from "next/navigation";
import { isCandidate } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { fromZodError, readString, savedSearchSchema, type ActionState } from "@/lib/validators";

export async function saveSearch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!isCandidate(user)) return { error: "Only candidates can save searches." };

  const parsed = savedSearchSchema.safeParse({
    name: readString(formData, "name"),
    query: readString(formData, "query"),
    location: readString(formData, "location"),
    employmentType: readString(formData, "employmentType"),
  });
  if (!parsed.success) return fromZodError(parsed.error);

  await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      query: parsed.data.query,
      location: parsed.data.location,
      employmentType: parsed.data.employmentType,
    },
  });

  redirect("/saved-searches");
}

export async function deleteSavedSearch(formData: FormData) {
  const user = await requireUser();
  if (!isCandidate(user)) redirect("/dashboard");

  const id = readString(formData, "id");
  if (id) {
    await prisma.savedSearch.deleteMany({ where: { id, userId: user.id } });
  }
  redirect("/saved-searches");
}
