import { defineConfig } from "vitest/config";
import path from "node:path";

// Shared with the global setup (same process) through the environment.
const TEST_DATABASE_URL = (process.env.TEST_DATABASE_URL ??= "postgresql://alterpark:alterpark@localhost:5432/alterpark_test");

/*
 * Integration tests (`*.int.test.ts`) against a real PostgreSQL database.
 * TEST_DATABASE_URL defaults to the local test database; CI provides a PostgreSQL service.
 */

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "server-only": path.resolve(import.meta.dirname, "src/test/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    globalSetup: ["src/test/integration-setup.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 120_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      NEXT_PUBLIC_SITE_URL: "https://alterpark.test",
      IP_HASH_SALT: "integration-test-salt-integration-test-salt",
      EMAIL_TRANSPORT: "console",
      EMAIL_FROM: "ALTERPARK <test@example.com>",
      ADMIN_NOTIFICATION_EMAIL: "ops@example.com",
    },
  },
});
