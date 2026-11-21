import { STATIC_PARKINGS } from "./catalog";
import type { ParkingSummary } from "./types";

/*
 * Public queries of the parkings feature. Phase 3: static catalogue. Phase 4: Prisma, with the
 * same signatures, cached with `use cache` and tagged `parking:<slug>` for back-office invalidation.
 */

export async function listParkings(): Promise<ParkingSummary[]> {
  return [...STATIC_PARKINGS];
}

export async function getParking(slug: string): Promise<ParkingSummary | null> {
  return STATIC_PARKINGS.find((p) => p.slug === slug) ?? null;
}

export function isBookable(p: ParkingSummary): boolean {
  return p.status === "ACTIVE" && p.offers.length > 0;
}
