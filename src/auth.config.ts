import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  // The credentials provider lives in src/auth.ts. Middleware only reads the JWT.
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (user && "role" in user && (user.role === "CANDIDATE" || user.role === "EMPLOYER")) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
