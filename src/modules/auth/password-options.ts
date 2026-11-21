/*
 * Argon2id parameters (OWASP Password Storage Cheat Sheet: m=19 MiB, t=2, p=1 minimum).
 * Changing them only affects new hashes; `needsRehash` upgrades old ones at next login.
 */
export const ARGON2_OPTIONS = {
  algorithm: 2, // Argon2id
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;
