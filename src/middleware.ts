import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const loggedIn = role === "CANDIDATE" || role === "EMPLOYER";
  const needsAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/saved-searches");

  if (needsAuth && !loggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/dashboard/employer") && role !== "EMPLOYER") {
    return NextResponse.redirect(new URL("/dashboard/candidate", req.nextUrl));
  }

  if (
    (pathname.startsWith("/dashboard/candidate") || pathname.startsWith("/saved-searches")) &&
    role !== "CANDIDATE"
  ) {
    return NextResponse.redirect(new URL("/dashboard/employer", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/saved-searches/:path*"],
};
