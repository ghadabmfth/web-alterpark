/*
 * Read model of the parkings feature, shared by pages and (Phase 4) the Prisma repository.
 * Mirrors Parking / ParkingOffer of prisma/schema.prisma, reduced to what public pages display.
 */

export type ParkingStatus = "DRAFT" | "ACTIVE" | "SUSPENDED";

export interface ParkingOfferSummary {
  code: string;
  name: string;
  shortName: string;
  tagline: string;
  features: string[];
  shuttleIncluded: boolean;
  walkMinutes?: number;
  highlighted: boolean;
  /** Starting price in cents incl. VAT, when a validated rate exists. Never guessed. */
  fromCents?: number;
}

export interface ParkingSummary {
  slug: string;
  name: string;
  /** IATA code of the airport served. */
  airportCode: "NTE" | "MRS" | "CDG" | string;
  airportName: string;
  city: string;
  region: string;
  timeZone: string;
  /** Bookable only when ACTIVE. */
  status: ParkingStatus;
  address?: { line: string; postalCode: string; city: string; country: string };
  geo?: { latitude: number; longitude: number };
  phone?: string;
  email?: string;
  /** One-paragraph presentation. */
  description: string;
  /** Practical information shown on the detail page. */
  practicalInfo: string[];
  openingHours?: string;
  offers: ParkingOfferSummary[];
  minLeadMinutes: number;
}
