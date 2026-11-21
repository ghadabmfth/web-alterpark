import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // Integration tests need PostgreSQL: `npm run test:integration`.
    exclude: ["src/**/*.int.test.ts", "node_modules/**"],
  },
});
