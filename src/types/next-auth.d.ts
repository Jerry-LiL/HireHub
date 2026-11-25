import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    role: "CANDIDATE" | "EMPLOYER";
  }

  interface Session {
    user: {
      id: string;
      role: "CANDIDATE" | "EMPLOYER";
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "CANDIDATE" | "EMPLOYER";
  }
}
