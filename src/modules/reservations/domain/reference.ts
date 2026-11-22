import { randomInt } from "node:crypto";

/*
 * Human reservation reference: AP-<IATA>-<6 chars>, e.g. AP-NTE-7K3Q9M. Random (not sequential: it
 * reveals no volume and cannot be guessed from another one), without 0/O/1/I to avoid misreading.
 * 32^6 ≈ 1.07 billion combinations; the unique constraint catches the rare collision (retried).
 */
export const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function newReference(airportCode: string, rand: (max: number) => number = randomInt): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += REFERENCE_ALPHABET[rand(REFERENCE_ALPHABET.length)];
  return `AP-${airportCode.toUpperCase().slice(0, 3)}-${suffix}`;
}

export const REFERENCE_RE = /^AP-[A-Z]{3}-[2-9A-HJ-NP-Z]{6}$/;
