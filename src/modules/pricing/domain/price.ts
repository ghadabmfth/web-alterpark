/*
 * Pricing engine — pure (DATA-MODEL.md, "Pricing rule"). For an offer and a stay of n billed days:
 * rate rows whose validity contains the ARRIVAL date and whose [minDays, maxDays] contains n (or n
 * exceeds maxDays and the row has an extra-day amount) apply; the highest priority wins.
 * FLAT → amountCents; PER_DAY → amountCents × days (up to maxDays); beyond maxDays add
 * extraDayCents per extra day. No applicable row → null: a price is never guessed.
 */

export type PricingMode = "FLAT" | "PER_DAY";

export interface RateRow {
  id: string;
  /** YYYY-MM-DD, inclusive */
  validFrom: string;
  /** YYYY-MM-DD, inclusive; null = open-ended */
  validTo: string | null;
  minDays: number;
  maxDays: number | null;
  mode: PricingMode;
  amountCents: number;
  extraDayCents: number;
  priority: number;
  currency: string;
}

export interface PriceBreakdown {
  rateId: string;
  mode: PricingMode;
  days: number;
  /** Days billed by the base rule (capped by maxDays). */
  baseDays: number;
  baseCents: number;
  extraDays: number;
  extraDayCents: number;
  extraCents: number;
}

export interface PriceResult {
  rateId: string;
  currency: string;
  totalCents: number;
  breakdown: PriceBreakdown;
}

export function rateApplies(r: RateRow, arrivalDate: string, days: number): boolean {
  if (arrivalDate < r.validFrom) return false;
  if (r.validTo !== null && arrivalDate > r.validTo) return false;
  if (days < r.minDays) return false;
  if (r.maxDays !== null && days > r.maxDays && r.extraDayCents <= 0) return false;
  return true;
}

/** Deterministic choice among applicable rows. */
function compareRates(days: number) {
  const covers = (r: RateRow) => (r.maxDays === null || days <= r.maxDays ? 1 : 0);
  return (a: RateRow, b: RateRow) =>
    b.priority - a.priority ||
    covers(b) - covers(a) || // a row whose range contains n beats an extension beyond maxDays
    b.minDays - a.minDays || // the more specific range
    b.validFrom.localeCompare(a.validFrom) || // the most recent rate
    a.id.localeCompare(b.id);
}

export function priceStay(rates: readonly RateRow[], arrivalDate: string, days: number): PriceResult | null {
  if (!Number.isInteger(days) || days < 1) return null;
  const rate = rates.filter((r) => rateApplies(r, arrivalDate, days)).sort(compareRates(days))[0];
  if (!rate) return null;
  const baseDays = rate.maxDays === null ? days : Math.min(days, rate.maxDays);
  const extraDays = days - baseDays;
  const baseCents = rate.mode === "FLAT" ? rate.amountCents : rate.amountCents * baseDays;
  const extraCents = extraDays * rate.extraDayCents;
  return {
    rateId: rate.id,
    currency: rate.currency,
    totalCents: baseCents + extraCents,
    breakdown: { rateId: rate.id, mode: rate.mode, days, baseDays, baseCents, extraDays, extraDayCents: rate.extraDayCents, extraCents },
  };
}
