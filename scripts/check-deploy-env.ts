/*
 * First step of every Vercel build (npm run build:vercel): checks the deployment configuration.
 * Errors stop the build with an explicit message; warnings are printed. Values are never printed.
 */
import { checkDeployEnv } from "../src/server/config/deploy-check";

const { errors, warnings } = checkDeployEnv(process.env);
const target = process.env.VERCEL_ENV ?? "development";
for (const w of warnings) console.warn(`[deploy:${target}] warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`[deploy:${target}] ERROR: ${e}`);
  console.error(`[deploy:${target}] Configuration refused (${errors.length} error(s)). Fix the variables in Vercel → Settings → Environment Variables.`);
  process.exit(1);
}
console.log(`[deploy:${target}] configuration checked (${warnings.length} warning(s)).`);
