import type { StepItem } from "@/components/ui/content/Steps";

/*
 * Editorial content of the public site. Sources:
 * - client copy supplied in the design system (hero, steps, FAQ answers, Nantes news, Rallye du Cœur);
 * - business rules approved on 20/11/2026 (docs/AUDIT.md §3): online payment at booking, account
 *   required, free cancellation until 24 h before arrival, booking at least 2 h ahead.
 * Phase 7 moves editable content to the back office.
 */

export const HERO = {
  title: "Votre parking à proximité de l’aéroport, commencez vos vacances en toute sérénité !",
  intro:
    "Simplifiez vos départs avec AlterPark, votre solution de stationnement pratique et sécurisée à proximité des aéroports de Nantes, Marseille et Paris-Roissy.",
};

/** The four steps of the hero (client copy). */
export const HOW_IT_WORKS_STEPS: StepItem[] = [
  { icon: "stepReserver", title: "Réservez votre place en ligne", text: "7 jours/7 et 24h/24" },
  { icon: "stepDeposer", title: "Déposez votre véhicule au parking", text: "Vidéo surveillance & gardiennage" },
  { icon: "stepNavette", title: "Nous vous déposons à l’aéroport", text: "Navette gratuite sans attente" },
  { icon: "stepVacances", title: "Profitez de vos vacances", text: "Votre véhicule vous attend à votre retour" },
];

/** Detailed explanation of each step (how-it-works page). Approved rules only. */
export const HOW_IT_WORKS_DETAILS = [
  {
    title: "Réservez votre place en ligne",
    text: "Choisissez votre parking, vos dates et votre formule. Le prix est calculé pour vos dates exactes et réglé en ligne, par paiement sécurisé. Réservez au moins 2 heures avant votre arrivée au parking.",
  },
  {
    title: "Déposez votre véhicule au parking",
    text: "Présentez-vous à l’accueil avec votre référence de réservation. Le parking est sous vidéosurveillance et gardiennage.",
  },
  {
    title: "Nous vous déposons à l’aéroport",
    text: "Avec la formule ALTERPARK, la navette gratuite vous dépose au pied du terminal, sans attente. Comptez 15 minutes entre l’accueil et votre arrivée au terminal (hors périodes d’affluence).",
  },
  {
    title: "Profitez de vos vacances",
    text: "À votre retour, la navette vous ramène au parking et vous récupérez votre véhicule. Vos réservations et paiements restent consultables dans votre espace client.",
  },
];

export const FAQ = [
  {
    title: "Combien de temps faut-il pour rejoindre le terminal ?",
    content: "Comptez 15 minutes entre l’accueil et votre arrivée au terminal (hors périodes d’affluence).",
  },
  { title: "La navette est-elle gratuite ?", content: "Oui, la navette est gratuite et sans attente, avec le service standard." },
  {
    title: "Quelle est la différence entre ALTERPARK et ALTERECO ?",
    content: "ALTERPARK inclut la navette jusqu’au terminal. ALTERECO est un parking couvert et sécurisé, sans navette, à 15 minutes à pied du terminal.",
  },
  {
    title: "Quand dois-je payer ma réservation ?",
    content: "Le paiement se fait en ligne au moment de la réservation, par paiement sécurisé. Votre place est confirmée dès que le paiement est validé.",
  },
  {
    title: "Puis-je annuler ma réservation ?",
    content:
      "Oui. L’annulation est gratuite jusqu’à 24 heures avant votre arrivée au parking, depuis votre espace client. Passé ce délai, vous pouvez envoyer une demande d’annulation qui sera étudiée par notre équipe.",
  },
  {
    title: "Combien de temps à l’avance dois-je réserver ?",
    content: "Vous pouvez réserver jusqu’à 2 heures avant votre arrivée au parking, dans la limite des places disponibles.",
  },
  {
    title: "Dois-je créer un compte ?",
    content: "Oui, un compte est créé pendant la réservation. Il vous permet de retrouver vos réservations, vos paiements et de gérer une annulation.",
  },
  {
    title: "Le parking est-il surveillé ?",
    content: "Oui, le parking est sous vidéosurveillance et gardiennage.",
  },
];

/** Nantes news section (client copy). */
export const NANTES_NEWS = {
  title: "Que de changements chez ALTERPARK depuis le 20 mars !",
  paragraphs: [
    "ALTERPARK a apporté de nombreux changements pour améliorer votre expérience. Nous avons agrandi et modernisé notre hall d’accueil pour vous offrir un espace plus vaste, confortable et chaleureux.",
    "Enfin, nous proposons une offre imbattable en termes de service, de sécurité et de prix.",
  ],
};

export const RALLYE = {
  title: "ALTERPARK soutient le “Rallye du Cœur”",
  text: "Pour chaque réservation effectuée, ALTERPARK reverse 0,50 € au Rallye du Cœur, une initiative qui soutient la lutte contre le cancer chez l’enfant.",
};

/** Selling points under the booking bar. Only verified facts. */
export const BOOKING_PERKS = [
  { icon: "card" as const, text: "Paiement sécurisé en ligne" },
  { icon: "shield" as const, text: "Vidéosurveillance et gardiennage" },
  { icon: "h24" as const, text: "Parking 7j/7 – 24h/24" },
];
