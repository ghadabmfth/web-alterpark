import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // Generated Prisma client (Phase 4)
    "src/generated/**",
    // Design system reference bundle: read-only porting source, never executed by the app
    "docs/**",
  ]),
]);

export default eslintConfig;
