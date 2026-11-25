"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { dashboardPath } from "@/lib/authz";
import { isUniqueConstraint, prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import {
  fromZodError,
  loginSchema,
  readString,
  registerSchema,
  type ActionState,
} from "@/lib/validators";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: readString(formData, "email"),
    password: readString(formData, "password"),
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: dashboardPath(user.role),
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password." };
    throw error;
  }

  return { error: "Invalid email or password." };
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    password: readString(formData, "password"),
    role: readString(formData, "role"),
    companyName: readString(formData, "companyName"),
    companyLocation: readString(formData, "companyLocation"),
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role: parsed.data.role,
        },
      });
      if (parsed.data.role === "EMPLOYER") {
        await tx.company.create({
          data: {
            name: parsed.data.companyName,
            location: parsed.data.companyLocation || null,
            ownerId: user.id,
          },
        });
      }
    });
  } catch (error) {
    if (isUniqueConstraint(error)) {
      return { fieldErrors: { email: ["An account with that email already exists."] } };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: dashboardPath(parsed.data.role),
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Account created, but sign-in failed." };
    throw error;
  }

  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
