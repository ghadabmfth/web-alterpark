import type { ParkingSummary } from "./types";

/*
 * FALLBACK + SEED SOURCE. Used (1) by prisma/seed.ts to create the sites, and (2) by the queries
 * only when no database is configured (a static build before the database is provisioned).
 *
 * Contains only facts supplied by the client (design system, Nantes site). Nothing is invented:
 * - Every site is DRAFT (approved rule Q3): no capacity is known yet, so nothing is bookable.
 * - Marseille and Paris-Roissy have no confirmed address, offers or prices yet.
 * - No price is published: `fromCents` stays empty until the client validates the rate grid
 *   (the design system's €45 / €35 "dès" prices are marked "to verify").
 */
export const STATIC_PARKINGS: readonly ParkingSummary[] = [
  {
    slug: "nantes",
    name: "ALTERPARK Nantes Atlantique",
    airportCode: "NTE",
    airportName: "Aéroport Nantes Atlantique",
    city: "Nantes",
    region: "Pays de la Loire",
    timeZone: "Europe/Paris",
    status: "DRAFT",
    address: { line: "1 Rue Dieudonné Costes", postalCode: "44860", city: "Saint-Aignan-de-Grandlieu", country: "FR" },
    phone: "02 40 731 237",
    email: "contact@alterpark.fr",
    description:
      "Simplifiez vos départs avec AlterPark, votre solution de stationnement pratique et sécurisée à proximité de l’aéroport de Nantes.",
    practicalInfo: [
      "Comptez 15 minutes entre l’accueil et votre arrivée au terminal (hors périodes d’affluence).",
      "La navette est gratuite et sans attente, avec le service standard.",
      "Parking sous vidéosurveillance et gardiennage.",
    ],
    openingHours: "7 jours/7 et 24h/24",
    offers: [
      {
        code: "alterpark",
        name: "Parking ALTERPARK",
        shortName: "ALTERPARK",
        tagline: "Avec navette",
        features: ["Avec service navette", "Dépose au pied du terminal", "Accès espace convivialité"],
        shuttleIncluded: true,
        highlighted: true,
      },
      {
        code: "altereco",
        name: "Parking ALTERECO",
        shortName: "ALTERECO",
        tagline: "Sans navette · 15 min à pied",
        features: ["Sans navette (15 minutes à pied)", "Parking couvert et sécurisé", "Accès espace convivialité"],
        shuttleIncluded: false,
        walkMinutes: 15,
        highlighted: false,
      },
    ],
    minLeadMinutes: 120,
    maxStayDays: 60,
    bookingHorizonDays: 365,
    freeCancellationHours: 24,
  },
  {
    slug: "marseille",
    name: "ALTERPARK Marseille Provence",
    airportCode: "MRS",
    airportName: "Aéroport Marseille Provence",
    city: "Marseille",
    region: "Provence-Alpes-Côte d’Azur",
    timeZone: "Europe/Paris",
    status: "DRAFT",
    description: "Le parking ALTERPARK de l’aéroport Marseille Provence ouvrira prochainement à la réservation en ligne.",
    practicalInfo: [],
    offers: [],
    minLeadMinutes: 120,
    maxStayDays: 60,
    bookingHorizonDays: 365,
    freeCancellationHours: 24,
  },
  {
    slug: "paris-roissy",
    name: "ALTERPARK Paris-Roissy",
    airportCode: "CDG",
    airportName: "Aéroport Paris-Charles de Gaulle",
    city: "Roissy-en-France",
    region: "Île-de-France",
    timeZone: "Europe/Paris",
    status: "DRAFT",
    description: "Le parking ALTERPARK de l’aéroport Paris-Charles de Gaulle ouvrira prochainement à la réservation en ligne.",
    practicalInfo: [],
    offers: [],
    minLeadMinutes: 120,
    maxStayDays: 60,
    bookingHorizonDays: 365,
    freeCancellationHours: 24,
  },
];
