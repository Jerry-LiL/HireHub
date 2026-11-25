import { loadEnvFile } from "node:process";
import path from "node:path";
import { defineConfig } from "vitest/config";

try {
  loadEnvFile(".env");
} catch {
  // Unit tests do not need a database. Integration tests are included only
  // when DATABASE_URL is present.
}

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default defineConfig({
  test: {
    environment: "node",
    include: hasDatabase
      ? ["tests/**/*.test.ts"]
      : ["tests/unit/**/*.test.ts"],
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
