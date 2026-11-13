import "server-only";
import { z } from "zod";

const schema = z.object({
  WP_API_URL: z.url().transform((u) => u.replace(/\/+$/, "")),
  APBS_API_SECRET: z.string().min(32, "APBS_API_SECRET doit faire au moins 32 caractères"),
  REVALIDATE_SECRET: z.string().min(32, "REVALIDATE_SECRET doit faire au moins 32 caractères"),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

/** Variables serveur validées. Lève une erreur explicite si la configuration est incomplète. */
export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Configuration serveur invalide — ${issues}`);
  }
  cached = parsed.data;
  return cached;
}
