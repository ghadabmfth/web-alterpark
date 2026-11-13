/*
 * Données d'EXEMPLE de la galerie de développement (/dev/design-system), jamais rendues en production
 * (la page renvoie 404 hors développement). Elles ne doivent pas être importées ailleurs.
 */
import type { NavLink } from "@/components/navigation/Header/Header";
import type { ReviewCardProps } from "@/components/content/ReviewCard/ReviewCard";
import type { BookingOffer } from "@/components/patterns/BookingBar/BookingBar";
import type { BookingOfferQuote } from "@/components/booking/OfferCard/OfferCard";
import type { SearchParking } from "@/components/booking/BookingSearchForm/BookingSearchForm";

export const navLinks: NavLink[] = [
  { label: "Accueil", href: "#", active: true },
  { label: "Nos parkings", children: [{ label: "Roissy", href: "#" }, { label: "Nantes", href: "#" }, { label: "Marseille", href: "#" }] },
  { label: "Services", href: "#" },
  { label: "Fidélité", href: "#" },
  { label: "Contact", href: "#" },
];

export const heroSteps = [
  { icon: "stepReserver", title: "Réservez", text: "en ligne en 2 minutes" },
  { icon: "stepDeposer", title: "Déposez", text: "votre véhicule" },
  { icon: "stepNavette", title: "Prenez la navette", text: "jusqu’au terminal" },
  { icon: "stepVacances", title: "Profitez", text: "de vos vacances" },
];

export const loyaltySteps = [
  { icon: "fideliteCumulez", title: "Cumulez", text: "10 points par euro dépensé." },
  { icon: "fideliteCapitalisez", title: "Capitalisez", text: "Vos points restent valables sur votre compte." },
  { icon: "fideliteUtilisez", title: "Utilisez", text: "Déduisez vos points de votre prochaine réservation." },
];

export const reviews: ReviewCardProps[] = [
  { name: "Camille Durand", rating: 5, date: "il y a 2 semaines", text: "Accueil rapide, navette à l’heure. Parfait pour un départ tôt le matin." },
  {
    name: "Julien Moreau",
    rating: 4,
    date: "il y a 1 mois",
    text: "Réservation simple, prix clair et parking bien éclairé. Au retour, la navette nous attendait à la sortie du terminal alors que notre vol avait du retard. Je recommande pour les longs séjours.",
  },
  { name: "Sophie Bernard", rating: 5, date: "il y a 3 mois", text: "Très bon rapport qualité-prix, personnel souriant." },
  { name: "Nicolas Petit", rating: 4.5, date: "il y a 4 mois", text: "Tout s’est bien passé, de la réservation au retour." },
];

export const barOffers: BookingOffer[] = [
  { id: "navette", name: "Parking avec navette", short: "AVEC NAVETTE", tagline: "Dépose au terminal", badge: "Le plus demandé !", highlight: true, from: 45, features: ["Navette jusqu’au terminal", "Parking sécurisé", "Accès 24h/24"] },
  { id: "eco", name: "Parking éco", short: "ÉCO", tagline: "15 min à pied", from: 35, features: ["Sans navette", "Parking couvert", "Accès 24h/24"] },
];

export const parkings: SearchParking[] = [
  { id: "roissy", name: "Roissy", minLeadMinutes: 120, timeZone: "Europe/Paris" },
  { id: "nantes", name: "Nantes", minLeadMinutes: 120, timeZone: "Europe/Paris" },
  { id: "marseille", name: "Marseille", minLeadMinutes: 120, timeZone: "Europe/Paris" },
];

export const quotes: BookingOfferQuote[] = [
  { id: "navette", name: "Avec navette", badge: "Le plus demandé", highlight: true, features: ["Navette jusqu’au terminal", "Parking sécurisé et surveillé", "Accès 24h/24"], totalCents: 6480 },
  { id: "eco", name: "Éco", description: "Le terminal est à 15 minutes à pied.", features: ["Parking couvert", "Accès 24h/24"], totalCents: 4560 },
  { id: "premium", name: "Premium", features: ["Place réservée près de l’accueil", "Navette prioritaire"], totalCents: 8900, available: false },
];

// Séjour d'exemple : du 20/11/2026 08:00 au 27/11/2026 18:00, heure de Paris.
export const stay = { start: Date.UTC(2026, 10, 20, 7, 0), end: Date.UTC(2026, 10, 27, 17, 0), days: 8 };
export const priceLines = [
  { label: "Stationnement, 8 jours", amountCents: 5760 },
  { label: "Remise fidélité", amountCents: -1200 },
];
